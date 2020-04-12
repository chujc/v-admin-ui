<template>
  <!-- 导入表 -->
  <el-dialog title="选择数据库表" :visible.sync="visible" width="800px" top="5vh">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="表名称" prop="table_name">
        <el-input
          v-model="queryParams.table_name"
          placeholder="请输入表名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="表描述" prop="table_comment">
        <el-input
          v-model="queryParams.table_comment"
          placeholder="请输入表描述"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table @row-click="clickRow" ref="table" :data="dbTableList" @selection-change="handleSelectionChange" height="600px">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="table_name" label="表名称"></el-table-column>
        <el-table-column prop="table_comment" label="表描述"></el-table-column>
        <el-table-column prop="create_time" label="创建时间"></el-table-column>
        <el-table-column prop="update_time" label="更新时间"></el-table-column>
      </el-table>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleImportTable">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { listDbTable, importGeneratorTable } from '@/api/tool/generator'

  export default {
    data() {
      return {
        // 遮罩层
        visible: false,
        // 选中数组值
        tables: [],
        // 总条数
        total: 0,
        // 表数据
        dbTableList: [],
        // 查询参数
        queryParams: {
          table_name: undefined,
          table_comment: undefined
        }
      }
    },
    methods: {
      // 显示弹框
      show() {
        this.getList()
        this.visible = true
      },
      clickRow(row) {
        this.$refs.table.toggleRowSelection(row)
      },
      /** 多选框选中数据 */
      handleSelectionChange(selection) {
        this.tables = selection.map(item => item.table_name)
      },
      /** 查询表数据 */
      getList() {
        listDbTable(this.queryParams).then(res => {
          if (res.code === 200) {
            this.dbTableList = res.data
            this.total = res.total
          }
        })
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.getList()
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm('queryForm')
        this.handleQuery()
      },
      /** 导入按钮操作 */
      handleImportTable() {
        importGeneratorTable({ tables: this.tables.join(',') }).then(res => {
          if (res.code === 200) {
            this.msgSuccess('导入成功')
            this.visible = false
            this.$emit('ok')
          }
        })
      }
    }
  }
</script>
