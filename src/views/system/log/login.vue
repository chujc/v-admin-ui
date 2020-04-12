<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="登录ip" prop="ip">
        <el-input
          v-model="queryParams.ip"
          placeholder="请输入登录地址"
          clearable
          style="width: 150px;"
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="账号" prop="username">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入账号"
          clearable
          style="width: 150px;"
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="登录状态"
          clearable
          size="small"
          style="width: 150px"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dict_value"
            :label="dict.dict_label"
            :value="dict.dict_value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="登录时间">
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
          v-has-permission="['admin.logs.login.destroy']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          @click="handleClean"
          v-has-permission="['admin.logs.login.destroy']"
        >清空
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-dropdown trigger="click" @command="handleExport" v-has-permission="['admin.logs.login.export']">
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
      <el-table-column label="账号" align="center" prop="username"/>
      <el-table-column label="IP" align="center" prop="ip" width="130" :show-overflow-tooltip="true"/>
      <el-table-column label="地址" align="center" prop="location" width="200" :show-overflow-tooltip="true"/>
      <el-table-column label="浏览器" align="center" prop="browser"/>
      <el-table-column label="操作系统" align="center" prop="os" width="100"/>
      <el-table-column label="登录状态" align="center" prop="status" :formatter="statusFormat" width="100"/>
      <el-table-column label="错误信息" align="center" prop="error"/>
      <el-table-column label="登录日期" align="center" prop="login_time" width="180"/>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.per_page"
      @pagination="getList"
    />
  </div>
</template>

<script>
  import { listLoginLog, delLoginLog, cleanLoginLog, exportLoginLog } from '@/api/system/loginLog'

  export default {
    name: 'LoginLog',
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
        // 状态数据字典
        statusOptions: [],
        // 日期范围
        dateRange: [],
        // 查询参数
        queryParams: {
          page: 1,
          per_page: 10,
          ip: undefined,
          username: undefined,
          status: undefined
        }
      }
    },
    created() {
      this.getList()
      this.getDicts('system_login_status').then(response => {
        this.statusOptions = response.data
      })
    },
    methods: {
      /** 查询登录日志列表 */
      getList() {
        this.loading = true
        listLoginLog(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
            this.list = response.data
            this.total = response.total
            this.loading = false
          }
        )
      },
      // 登录状态字典翻译
      statusFormat(row, column) {
        return this.selectDictLabel(this.statusOptions, row.status)
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
      /** 删除按钮操作 */
      handleDelete(row) {
        const id = row.id || this.ids
        this.$confirm('是否确认删除访问编号为"' + id + '"的数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return delLoginLog(id)
        }).then(() => {
          this.queryParams.page = 1
          this.getList()
          this.msgSuccess('删除成功')
        }).catch(function() {
        })
      },
      /** 清空按钮操作 */
      handleClean() {
        this.$confirm('是否确认清空所有登录日志数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return cleanLoginLog()
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
        this.$confirm('是否确认导出登录日志数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return exportLoginLog(queryParams)
        }).then(response => {
          this.download(response.message)
        }).catch(function() {
        })
      }
    }
  }
</script>

