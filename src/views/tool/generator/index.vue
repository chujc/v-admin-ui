<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="表名称" prop="table_name">
        <el-input
          v-model="queryParams.table_name"
          placeholder="请输入表名称"
          clearable
          size="small"
        />
      </el-form-item>
      <el-form-item label="表描述" prop="table_comment">
        <el-input
          v-model="queryParams.table_comment"
          placeholder="请输入表描述"
          clearable
          size="small"
        />
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 150px"
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
        <el-button type="danger" icon="el-icon-upload" size="mini" @click="openImportTable">选择数据库表</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tableList">
      <el-table-column label="序号" align="center" prop="table_id" width="50px"/>
      <el-table-column
        label="表名称"
        align="center"
        prop="table_name"
        :show-overflow-tooltip="true"
        width="130"
      />
      <el-table-column
        label="表描述"
        align="center"
        prop="table_comment"
        :show-overflow-tooltip="true"
        width="200"
      />
      <el-table-column
        label="controller"
        align="center"
        prop="class_name"
        :show-overflow-tooltip="true"
        width="200"
      />
      <el-table-column label="创建时间" align="center" prop="create_time" width="160"/>
      <el-table-column label="更新时间" align="center" prop="update_time" width="160"/>
      <el-table-column label="操作" align="center" class-name="small-padding">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEditTable(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
          <el-button type="primary" size="mini" icon="el-icon-download" @click="handleGenTable(scope.row)">生成代码
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
    <import-table ref="import" @ok="handleQuery"/>
  </div>
</template>

<script>
  import { listGeneratorTable, delGeneratorTable, buildUrl } from '@/api/tool/generator'
  import importTable from './importTable'
  import { downLoadZip } from '@/utils/download'

  export default {
    name: 'Generator',
    components: { importTable },
    data() {
      return {
        // 遮罩层
        loading: true,
        // 唯一标识符
        uniqueId: '',
        // 总条数
        total: 0,
        // 表数据
        tableList: [],
        // 日期范围
        dateRange: '',
        // 查询参数
        queryParams: {
          page: 1,
          per_page: 10,
          table_name: undefined,
          table_comment: undefined
        },
        // 预览参数
        preview: {
          open: false,
          title: '代码预览',
          data: {},
          activeName: 'domain.java'
        }
      }
    },
    created() {
      this.getList()
    },
    activated() {
      const time = this.$route.query.t
      if (time != null && time != this.uniqueId) {
        this.uniqueId = time
        this.resetQuery()
      }
    },
    methods: {
      /** 查询表集合 */
      getList() {
        this.loading = true
        listGeneratorTable(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
            this.tableList = response.data
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
      /** 生成代码操作 */
      handleGenTable(row) {
        const ids = row.table_id || this.ids
        if (ids == '') {
          this.msgError('请选择要生成的数据')
          return
        }
        downLoadZip(buildUrl + ids)
      },
      /** 打开导入表弹窗 */
      openImportTable() {
        this.$refs.import.show()
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.dateRange = []
        this.resetForm('queryForm')
        this.handleQuery()
      },
      /** 修改按钮操作 */
      handleEditTable(row) {
        const table_id = row.table_id || this.ids[0]
        this.$router.push({ path: '/generator/edit', query: { table_id: table_id } })
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const table_ids = row.table_id || this.ids
        this.$confirm('是否确认删除表编号为"' + table_ids + '"的数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return delGeneratorTable(table_ids)
        }).then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        }).catch(function() {
        })
      }
    }
  }
</script>
