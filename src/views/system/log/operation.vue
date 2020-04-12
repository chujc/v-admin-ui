<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="操作人员" prop="oper_name">
        <el-input
          v-model="queryParams.oper_name"
          placeholder="请输入操作人员"
          clearable
          style="width: 150px;"
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="登录IP" prop="ip">
        <el-input
          v-model="queryParams.ip"
          placeholder="请输入登录地址"
          clearable
          style="width: 150px;"
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="请求方式" prop="method">
        <el-select
          v-model="queryParams.method"
          placeholder="请选择请求方式"
          clearable
          size="small"
          style="width: 150px"
        >
          <el-option
            v-for="(item, index) in methodOptions"
            :key="index"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-input
          v-model="queryParams.status"
          placeholder="请输入操作状态"
          clearable
          style="width: 150px;"
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="操作时间">
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
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-has-permission="['admin.logs.operation.destroy']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          @click="handleClean"
          v-has-permission="['admin.logs.operation.destroy']"
        >清空
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-dropdown trigger="click" @command="handleExport" v-has-permission="['admin.logs.operation.export']">
          <el-button type="warning" size="mini">
            导出<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="all"> 全部</el-dropdown-item>
            <el-dropdown-item command="page">当前页</el-dropdown-item>
            <el-dropdown-item command="select" :disabled="multiple">选择项</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="ID" align="center" prop="id" width="60"/>
      <el-table-column label="请求方式" align="center" prop="method" width="80"/>
      <el-table-column label="请求地址" prop="url" width="500"/>
      <el-table-column label="操作人员" align="center" prop="oper_name"/>
      <el-table-column label="IP" align="center" prop="ip" width="130" :show-overflow-tooltip="true"/>
      <el-table-column label="地址" align="center" prop="location" width="200" :show-overflow-tooltip="true"/>
      <el-table-column label="操作状态" align="center" prop="status"/>
      <el-table-column label="操作日期" align="center" prop="created_at" width="180"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row,scope.index)"
            v-has-permission="['admin.logs.operation.show']"
          >详细
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

    <!-- 操作日志详细 -->
    <el-dialog title="操作日志详细" :visible.sync="open" width="600px">
      <el-form ref="form" :model="form" label-width="120px" size="mini">
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="登录信息："
            >{{ form.oper_name }} / {{ form.ip }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="地址："
            >{{ form.location }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求地址：">{{ form.url }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求方式：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求参数：">{{ form.params }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="user_agent：">{{ form.http_user_agent }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作状态：">
              {{ form.status }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作时间：">{{ form.created_at }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="异常信息：">{{ form.message }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { listOperationLog, delOperationLog, cleanOperationLog, exportOperationLog } from '@/api/system/operationLog'
  import { getToken } from '@/utils/auth'

  export default {
    name: 'OperationLog',
    data() {
      return {
        // 遮罩层
        loading: true,
        // 选中数组
        ids: [],
        // 非多个禁用
        multiple: true,
        // 总条数
        total: 0,
        // 表格数据
        list: [],
        // 是否显示弹出层
        open: false,
        // 日期范围
        dateRange: [],
        methodOptions: [
          'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH'
        ],
        // 表单参数
        form: {},
        // 查询参数
        queryParams: {
          page: 1,
          per_page: 10,
          title: undefined,
          oper_name: undefined,
          businessType: undefined,
          status: undefined
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {
      /** 查询登录日志 */
      getList() {
        this.loading = true
        listOperationLog(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
            this.list = response.data
            this.total = response.total
            this.loading = false
          }
        )
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
      /** 多选框选中数据 */
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.id)
        this.multiple = !selection.length
      },
      /** 详细按钮操作 */
      handleView(row) {
        this.open = true
        this.form = row
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const ids = row.id || this.ids
        this.$confirm('是否确认删除日志编号为"' + ids + '"的数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return delOperationLog(ids)
        }).then(() => {
          this.queryParams.page = 1
          this.getList()
          this.msgSuccess('删除成功')
        }).catch(function() {
        })
      },
      /** 清空按钮操作 */
      handleClean() {
        this.$confirm('是否确认清空所有操作日志数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return cleanOperationLog()
        }).then(() => {
          this.getList()
          this.msgSuccess('清空成功')
        }).catch(function() {
        })
      },
      /** 导出按钮操作 */
      handleExport(command) {
        const queryParams = {
          command,
          ...this.queryParams,
          ids: this.ids.join(',')
        }
        this.$confirm('是否确认导出操作日志数据项?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return exportOperationLog(queryParams)
        })
      }
    }
  }
</script>

