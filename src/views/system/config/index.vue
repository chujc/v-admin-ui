<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="参数名称" prop="config_name">
        <el-input
          v-model="queryParams.config_name"
          placeholder="请输入参数名称"
          clearable
          size="small"
          style="width: 150px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="参数键名" prop="config_key">
        <el-input
          v-model="queryParams.config_key"
          placeholder="请输入参数键名"
          clearable
          size="small"
          style="width: 150px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="系统内置" prop="is_system">
        <el-select v-model="queryParams.is_system" placeholder="系统内置" clearable size="small" style="width: 100px">
          <el-option
            v-for="dict in typeOptions"
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
          v-has-permission="['admin.dict.configs.store']"
        >新增
        </el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
      <el-table-column label="ID" align="center" prop="config_id" width="80"/>
      <el-table-column label="参数名称" align="center" prop="config_name" :show-overflow-tooltip="true"/>
      <el-table-column label="参数键名" align="center" prop="config_key" :show-overflow-tooltip="true"/>
      <el-table-column label="参数键值" align="center" prop="config_value"/>
      <el-table-column label="系统内置" align="center" prop="is_system" :formatter="typeFormat" width="80"/>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" width="400"/>
      <el-table-column label="创建时间" align="center" prop="created_at" width="180"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-has-permission="['admin.dict.configs.update']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-has-permission="['admin.dict.configs.destroy']"
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
        <el-form-item label="参数名称" prop="config_name">
          <el-input v-model="form.config_name" placeholder="请输入参数名称"/>
        </el-form-item>
        <el-form-item label="参数键名" prop="config_key">
          <el-input v-model="form.config_key" placeholder="请输入参数键名"/>
        </el-form-item>
        <el-form-item label="参数键值" prop="config_value">
          <el-input v-model="form.config_value" placeholder="请输入参数键值"/>
        </el-form-item>
        <el-form-item label="系统内置" prop="is_system">
          <el-radio-group v-model="form.is_system">
            <el-radio
              v-for="dict in typeOptions"
              :key="parseInt(dict.dict_value)"
              :label="parseInt(dict.dict_value)"
            >{{dict.dict_label}}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"/>
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
  import { listConfig, getConfig, delConfig, addConfig, updateConfig, exportConfig } from '@/api/system/config'

  export default {
    name: 'Config',
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
        // 参数表格数据
        configList: [],
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 类型数据字典
        typeOptions: [],
        // 日期范围
        dateRange: [],
        // 查询参数
        queryParams: {
          page: 1,
          per_page: 10,
          config_name: undefined,
          config_key: undefined,
          is_system: undefined
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          config_name: [
            { required: true, message: '参数名称不能为空', trigger: 'blur' }
          ],
          config_key: [
            { required: true, message: '参数键名不能为空', trigger: 'blur' }
          ],
          config_value: [
            { required: true, message: '参数键值不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      this.getList()
      this.getDicts('system_built_in').then(response => {
        this.typeOptions = response.data
      })
    },
    methods: {
      /** 查询参数列表 */
      getList() {
        this.loading = true
        listConfig(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
            this.configList = response.data
            this.total = response.total
            this.loading = false
          }
        )
      },
      // 参数系统内置字典翻译
      typeFormat(row, column) {
        return this.selectDictLabel(this.typeOptions, row.is_system)
      },
      // 取消按钮
      cancel() {
        this.open = false
        this.reset()
      },
      // 表单重置
      reset() {
        this.form = {
          config_id: undefined,
          config_name: undefined,
          config_key: undefined,
          config_value: undefined,
          is_system: 1,
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
        this.title = '添加参数'
      },
      /** 多选框选中数据 */
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.config_id)
        this.single = selection.length != 1
        this.multiple = !selection.length
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset()
        const config_id = row.config_id || this.ids
        getConfig(config_id).then(response => {
          this.form = response.data
          this.open = true
          this.title = '修改参数'
        })
      },
      /** 提交按钮 */
      submitForm: function() {
        this.$refs['form'].validate(valid => {
          if (valid) {
            if (this.form.config_id != undefined) {
              updateConfig(this.form.config_id, this.form).then(response => {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()

              })
            } else {
              addConfig(this.form).then(response => {
                this.msgSuccess('新增成功')
                this.open = false
                this.getList()
              })
            }
          }
        })
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const config_ids = row.config_id || this.ids
        this.$confirm('是否确认删除参数编号为"' + config_ids + '"的数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return delConfig(config_ids)
        }).then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        }).catch(function() {
        })
      },
      /** 导出按钮操作 */
      handleExport() {
        const queryParams = this.queryParams
        this.$confirm('是否确认导出所有参数数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return exportConfig(queryParams)
        }).then(response => {
          this.download(response.message)
        }).catch(function() {
        })
      }
    }
  }
</script>
