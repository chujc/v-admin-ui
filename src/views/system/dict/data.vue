<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="字典名称" prop="dict_type">
        <el-select v-model="queryParams.dict_type" size="small">
          <el-option
            v-for="item in typeOptions"
            :key="item.dict_id"
            :label="item.dict_name"
            :value="item.dict_type"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="字典标签" prop="dict_label">
        <el-input
          v-model="queryParams.dict_label"
          placeholder="请输入字典标签"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="数据状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="parseInt(dict.dict_value)"
            :label="dict.dict_label"
            :value="parseInt(dict.dict_value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd"
                   v-has-permission="['admin.dict.data.store']">新增
        </el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="dataList">
      <el-table-column label="字典编码" align="center" prop="dict_code"/>
      <el-table-column label="字典标签" align="center" prop="dict_label"/>
      <el-table-column label="字典键值" align="center" prop="dict_value"/>
      <el-table-column label="字典排序" align="center" prop="dict_order"/>
      <el-table-column label="状态" align="center" prop="status" :formatter="statusFormat"/>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true"/>
      <el-table-column label="创建时间" align="center" prop="created_at" width="180"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-has-permission="['admin.dict.data.update']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-has-permission="['admin.dict.data.destroy']"
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
        <el-form-item label="字典类型">
          <el-input v-model="form.dict_type" :disabled="true"/>
        </el-form-item>
        <el-form-item label="数据标签" prop="dict_label">
          <el-input v-model="form.dict_label" placeholder="请输入数据标签"/>
        </el-form-item>
        <el-form-item label="数据键值" prop="dict_value">
          <el-input v-model="form.dict_value" placeholder="请输入数据键值"/>
        </el-form-item>
        <el-form-item label="显示排序" prop="dict_order">
          <el-input-number v-model="form.dict_order" controls-position="right" :min="0"/>
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
  import { listData, getData, delData, addData, updateData, exportData } from '@/api/system/dict/data'
  import { listType, getType } from '@/api/system/dict/type'

  export default {
    name: 'Data',
    data() {
      return {
        // 遮罩层
        loading: true,
        // 选中数组
        ids: [],
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 总条数
        total: 0,
        // 字典表格数据
        dataList: [],
        // 默认字典类型
        defaultDictType: '',
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 状态数据字典
        statusOptions: [],
        // 类型数据字典
        typeOptions: [],
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
          dict_label: [
            { required: true, message: '数据标签不能为空', trigger: 'blur' }
          ],
          dict_value: [
            { required: true, message: '数据键值不能为空', trigger: 'blur' }
          ],
          dict_order: [
            { required: true, message: '数据顺序不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      const dictId = this.$route.params && this.$route.params.dictId
      console.log(dictId)
      this.getType(dictId)
      this.getTypeList()
      this.getDicts('system_common_status').then(response => {
        this.statusOptions = response.data
      })
    },
    methods: {
      /** 查询字典类型详细 */
      getType(dict_id) {
        getType(dict_id).then(response => {
          this.queryParams.dict_type = response.data.dict_type
          this.defaultDictType = response.data.dict_type
          this.getList()
        })
      },
      /** 查询字典类型列表 */
      getTypeList() {
        listType().then(response => {
          this.typeOptions = response.data
        })
      },
      /** 查询字典数据列表 */
      getList() {
        this.loading = true
        listData(this.queryParams).then(response => {
          this.dataList = response.data
          this.total = response.total
          this.loading = false
        })
      },
      // 数据状态字典翻译
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
          dict_code: undefined,
          dict_label: undefined,
          dict_value: undefined,
          dict_order: 0,
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
        this.resetForm('queryForm')
        this.queryParams.dict_type = this.defaultDictType
        this.handleQuery()
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset()
        this.open = true
        this.title = '添加字典数据'
        this.form.dict_type = this.queryParams.dict_type
      },
      /** 多选框选中数据 */
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.dict_code)
        this.single = selection.length != 1
        this.multiple = !selection.length
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset()
        const dict_code = row.dict_code || this.ids
        getData(dict_code).then(response => {
          this.form = response.data
          this.open = true
          this.title = '修改字典数据'
        })
      },
      /** 提交按钮 */
      submitForm: function() {
        this.$refs['form'].validate(valid => {
          if (valid) {
            if (this.form.dict_code != undefined) {
              updateData(this.form.dict_code, this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess('修改成功')
                  this.open = false
                  this.getList()
                }
              })
            } else {
              addData(this.form).then(response => {
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
        const dict_codes = row.dict_code || this.ids
        this.$confirm('是否确认删除字典编码为"' + dict_codes + '"的数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return delData(dict_codes)
        }).then(() => {
          this.queryParams.page = 1
          this.getList()
          this.msgSuccess('删除成功')
        }).catch(function() {
        })
      },
      /** 导出按钮操作 */
      handleExport() {
        const queryParams = this.queryParams
        this.$confirm('是否确认导出所有数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return exportData(queryParams)
        }).then(response => {
          this.download(response.message)
        }).catch(function() {
        })
      }
    }
  }
</script>
