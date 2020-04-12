<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="角色名称" prop="role_name">
        <el-input
          v-model="queryParams.role_name"
          placeholder="请输入角色名称"
          clearable
          size="small"
          style="width: 150px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="权限字符" prop="role_key">
        <el-input
          v-model="queryParams.role_key"
          placeholder="请输入权限字符"
          clearable
          size="small"
          style="width: 150px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="角色状态"
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
          v-has-permission="['admin.roles.store']"
        >新增
        </el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="roleList">
      <el-table-column label="ID" align="center" prop="role_id"/>
      <el-table-column label="角色名称" align="center" prop="role_name" :show-overflow-tooltip="true"/>
      <el-table-column label="权限字符" align="center" prop="role_key" :show-overflow-tooltip="true"/>
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status" type="success">正常</el-tag>
          <el-tag v-else type="danger">停用</el-tag>
          <el-switch
            v-if="scope.row.role_id !== 1"
            v-model="scope.row.status"
            :active-value=1
            :inactive-value=0
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="created_at"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-has-permission="['admin.roles.update']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-has-permission="['admin.roles.destroy']"
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

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="role_name">
          <el-input v-model="form.role_name" placeholder="请输入角色名称"/>
        </el-form-item>
        <el-form-item label="权限字符" prop="role_key">
          <el-input v-model="form.role_key" placeholder="请输入权限字符"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="parseInt(dict.dict_value)"
              :label="parseInt(dict.dict_value)"
            >{{dict.dict_label}}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-tree
            :data="menuOptions"
            show-checkbox
            ref="menu"
            node-key="menu_id"
            empty-text="加载中，请稍后"
            :props="defaultProps"
            :check-strictly=true
          ></el-tree>
        </el-form-item>
        <el-form-item label="备注">
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
  import { listRole, getRole, delRole, addRole, updateRole } from '@/api/system/role'
  import { treeselect as menuTreeselect, roleMenuTreeselect } from '@/api/system/menu'

  export default {
    name: 'Role',
    data() {
      return {
        // 遮罩层
        loading: true,
        // 总条数
        total: 0,
        // 角色表格数据
        roleList: [],
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 是否显示弹出层（数据权限）
        openDataScope: false,
        // 日期范围
        dateRange: [],
        // 状态数据字典
        statusOptions: [],
        // 菜单列表
        menuOptions: [],
        // 查询参数
        queryParams: {
          page: 1,
          per_page: 10,
          role_name: undefined,
          role_key: undefined,
          status: undefined
        },
        // 表单参数
        form: {},
        defaultProps: {
          children: 'children',
          label: 'menu_name'
        },
        // 表单校验
        rules: {
          role_name: [
            { required: true, message: '角色名称不能为空', trigger: 'blur' }
          ],
          role_key: [
            { required: true, message: '权限字符不能为空', trigger: 'blur' }
          ],
          role_order: [
            { required: true, message: '角色顺序不能为空', trigger: 'blur' }
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
      /** 查询角色列表 */
      getList() {
        this.loading = true
        listRole(this.addDateRange(this.queryParams, this.dateRange)).then(
          response => {
            this.roleList = response.data
            this.total = response.total
            this.loading = false
          }
        )
      },
      /** 查询菜单树结构 */
      getMenuTreeselect() {
        menuTreeselect().then(response => {
          this.menuOptions = response.data
        })
      },
      // 所有菜单节点数据
      getMenuAllCheckedKeys() {
        // 目前被选中的菜单节点
        let checkedKeys = this.$refs.menu.getHalfCheckedKeys()
        // 半选中的菜单节点
        let halfCheckedKeys = this.$refs.menu.getCheckedKeys()
        checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
        return checkedKeys
      },
      /** 根据角色ID查询菜单树结构 */
      getRoleMenuTreeselect(role_id) {
        roleMenuTreeselect(role_id).then(response => {
          this.menuOptions = response.menus
          this.$refs.menu.setCheckedKeys(response.checkedKeys)
        })
      },
      // 角色状态修改
      handleStatusChange(row) {
        let text = row.status === 1 ? '启用' : '停用'
        this.$confirm('确认要"' + text + '""' + row.role_name + '"角色吗?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return updateRole(row.role_id, { status: row.status })
        }).then(() => {
          this.msgSuccess(text + '成功')
        }).catch(function() {
          row.status = row.status === 1 ? 0 : 1
        })
      },
      // 取消按钮
      cancel() {
        this.open = false
        this.reset()
      },
      // 表单重置
      reset() {
        if (this.$refs.menu != undefined) {
          this.$refs.menu.setCheckedKeys([])
        }
        this.form = {
          role_id: undefined,
          role_name: undefined,
          role_key: undefined,
          role_order: 0,
          status: 1,
          menuIds: [],
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
        this.getMenuTreeselect()
        this.open = true
        this.title = '添加角色'
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset()
        const role_id = row.role_id
        // this.$nextTick(() => {
        //   this.getRoleMenuTreeselect(role_id);
        // });
        this.getMenuTreeselect()
        getRole(role_id).then(response => {
          this.form = response.data
          let menuIds = []
          response.data.menus.forEach(function(item) {
            menuIds.push(item.menu_id)
          })
          this.open = true
          this.$refs.menu.setCheckedKeys(menuIds)
          this.title = '修改角色'
        })
      },
      /** 提交按钮 */
      submitForm: function() {
        this.$refs['form'].validate(valid => {
          if (valid) {
            if (this.form.role_id != undefined) {
              this.form.menus = this.getMenuAllCheckedKeys()
              updateRole(this.form.role_id, this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess('修改成功')
                  this.reset()
                  this.open = false
                  this.getList()
                }
              })
            } else {
              this.form.menuIds = this.getMenuAllCheckedKeys()
              addRole(this.form).then(response => {
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
        const role_id = row.role_id
        this.$confirm('是否确认删除角色ID为"' + role_id + '"的数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return delRole(role_id)
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
