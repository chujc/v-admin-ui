<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="字典名称" prop="dict_name">
        <el-input
          v-model="queryParams.dict_name"
          placeholder="请输入字典名称"
          clearable
          size="small"
          style="width: 150px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="字典类型" prop="dict_type">
        <el-input
          v-model="queryParams.dict_type"
          placeholder="请输入字典类型"
          clearable
          size="small"
          style="width: 150px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="字典状态"
          clearable
          size="small"
          style="width: 100px"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="parseInt(dict.dict_value)"
            :label="dict.dict_label"
            :value="parseInt(dict.dict_value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 200px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-has-permission="['admin.dict.types.store']"
        >新增
        </el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="typeList">
      <el-table-column label="字典ID" align="center" prop="dict_id" width="80"/>
      <el-table-column label="字典名称" align="center" prop="dict_name" :show-overflow-tooltip="true"/>
      <el-table-column label="字典类型" align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <router-link :to="'/dict/type/data/' + scope.row.dict_id" class="link-type">
            <span>{{ scope.row.dict_type }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" :formatter="statusFormat"/>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" width="400"/>
      <el-table-column label="创建时间" align="center" prop="created_at" width="180"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-has-permission="['admin.dict.types.update']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-has-permission="['admin.dict.types.destroy']"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.per_page"
      @pagination="getList"
    />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典名称" prop="dict_name">
          <el-input v-model="form.dict_name" placeholder="请输入字典名称"/>
        </el-form-item>
        <el-form-item label="字典类型" prop="dict_type">
          <el-input v-model="form.dict_type" placeholder="请输入字典类型"/>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="parseInt(dict.dict_value)"
              :label="parseInt(dict.dict_value)"
            >{{dict.dict_label}}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { listType, getType, delType, addType, updateType } from '@/api/system/dict/type'

  export default {
    name: 'Dict',
    data() {
      return {
        // 遮罩层
        loading: true,
        // 总条数
        total: 0,
        // 字典表格数据
        typeList: [],
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 状态数据字典
        statusOptions: [],
        // 日期范围
        dateRange: [],
        // 查询参数
        queryParams: {
          page: 1,
          per_page: 10,
          dict_name: undefined,
          dict_type: undefined,
          status: undefined
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          dict_name: [
            { required: true, message: '字典名称不能为空', trigger: 'blur' }
          ],
          dict_type: [
            { required: true, message: '字典类型不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      this.getList()
      this.getDicts('system_common_status').then(response => {
        this.statusOptions = response.data
      })
    },
    methods: {
      /** 查询字典类型列表 */
      getList() {
        this.loading = true
        listType(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
            this.typeList = response.data
            this.total = response.total
            this.loading = false
          }
        )
      },
      // 字典状态字典翻译
      statusFormat(row, column) {
        return this.selectDictLabel(this.statusOptions, row.status)
      },
      // 取消按钮
      cancel() {
        this.open = false
        this.reset()
      },
      // 表单重置
      reset() {
        this.form = {
          dict_id: undefined,
          dict_name: undefined,
          dict_type: undefined,
          status: 1,
          remark: undefined
        }
        this.resetForm('form')
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.queryParams.page = 1
        this.getList()
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.dateRange = []
        this.resetForm('queryForm')
        this.handleQuery()
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset()
        this.open = true
        this.title = '添加字典类型'
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset()
        const dict_id = row.dict_id
        getType(dict_id).then(response => {
          this.form = response.data
          this.open = true
          this.title = '修改字典类型'
        })
      },
      /** 提交按钮 */
      submitForm: function() {
        this.$refs['form'].validate(valid => {
          if (valid) {
            if (this.form.dict_id != undefined) {
              updateType(this.form.dict_id, this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess('修改成功')
                  this.open = false
                  this.getList()
                }
              })
            } else {
              addType(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess('新增成功')
                  this.open = false
                  this.getList()
                }
              })
            }
          }
        })
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const dict_id = row.dict_id
        this.$confirm('是否确认删除字典ID为"' + dict_id + '"的数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return delType(dict_id)
        }).then(() => {
          this.queryParams.page = 1
          this.getList()
          this.msgSuccess('删除成功')
        }).catch(function() {
        })
      }
    }
  }
</script>
