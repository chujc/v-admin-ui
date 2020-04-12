<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="70px">
      <el-form-item label="账号" prop="username">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入账号"
          clearable
          size="small"
          style="width: 150px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input
          v-model="queryParams.nickname"
          placeholder="请输入用户昵称"
          clearable
          size="small"
          style="width: 150px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="用户状态"
          clearable
          size="small"
          style="width: 100px"
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
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-has-permission="['admin.users.store']"
        >新增
        </el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="userList">
      <el-table-column label="ID" align="center" prop="user_id" width="70"/>
      <el-table-column label="账号" align="center" prop="username" :show-overflow-tooltip="true" width="160"/>
      <el-table-column label="昵称" align="center" prop="nickname" :show-overflow-tooltip="true" width="160"/>
      <el-table-column label="角色" align="center">
        <template slot-scope="scope">
          <el-tag v-for="(role, key) in scope.row.roles" :key="key">{{ role.role_name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="120">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status" type="success">正常</el-tag>
          <el-tag v-else type="danger">停用</el-tag>
          <el-switch
            v-if="scope.row.user_id !== 1"
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true"/>
      <el-table-column label="最后登录IP" align="center" prop="login_ip" width="160"/>
      <el-table-column label="最后登录时间" align="center" prop="login_date" width="160"/>
      <el-table-column label="创建时间" align="center" prop="created_at" width="160"/>
      <el-table-column
        label="操作"
        align="center"
        width="240"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-has-permission="['admin.users.update']"
          >修改
          </el-button>
          <el-button
            v-if="scope.row.user_id !== 1"
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-has-permission="['admin.users.destroy']"
          >删除
          </el-button>
          <el-button
            size="mini"
            icon="el-icon-key"
            @click="handleResetPwd(scope.row)"
            v-has-permission="['admin.users.update']"
          >重置
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
    <el-dialog :title="title" :visible.sync="open" width="600px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item v-if="form.user_id === undefined" label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入账号"/>
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入用户昵称"/>
        </el-form-item>
        <el-form-item v-if="form.user_id === undefined" label="用户密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入用户密码" type="password"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="parseInt(dict.dict_value)"
              :label="parseInt(dict.dict_value)"
            >{{ dict.dict_label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.roles" multiple placeholder="请选择">
            <el-option
              v-for="item in roleOptions"
              :key="item.role_id"
              :label="item.role_name"
              :value="item.role_id"
              :disabled="item.status === 0"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
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
  import {
    listUser,
    getUser,
    delUser,
    addUser,
    updateUser
  } from '@/api/system/user'
  import { listRole } from '@/api/system/role'

  export default {
    name: 'SystemUser',
    data() {
      return {
        // 遮罩层
        loading: true,
        // 总条数
        total: 0,
        // 用户表格数据
        userList: null,
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 日期范围
        dateRange: [],
        // 状态数据字典
        statusOptions: [],
        // 角色选项
        roleOptions: [],
        // 表单参数
        form: {},
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        // 查询参数
        queryParams: {
          page: 1,
          per_page: 10,
          username: undefined,
          nickname: undefined,
          status: undefined
        },
        // 表单校验
        rules: {
          username: [
            { required: true, message: '账号不能为空', trigger: 'blur' }
          ],
          nickname: [
            { required: true, message: '用户昵称不能为空', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '用户密码不能为空', trigger: 'blur' },
            { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
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
      /** 查询用户列表 */
      getList() {
        this.loading = true
        listUser(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
            this.userList = response.data
            this.total = response.total
            this.loading = false
          }
        )
      },
      // 用户状态修改
      handleStatusChange(row) {
        const text = row.status === 1 ? '启用' : '停用'
        this.$confirm('确认要"' + text + '""' + row.username + '"用户吗?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return updateUser(row.user_id, { status: row.status })
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
        this.form = {
          user_id: undefined,
          username: undefined,
          password: undefined,
          nickname: undefined,
          status: 0,
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
        listRole({ select: true, status: 1 }).then(response => {
          this.roleOptions = response.data
          this.open = true
          this.title = '添加用户'
          this.form.status = 1
        })
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset()
        const user_id = row.user_id
        listRole({ select: true, status: 1 }).then(response => {
          this.roleOptions = response.data
        })

        getUser(user_id).then(response => {
          this.form = response.data
          const roleIds = []
          response.data.roles.forEach(function(item) {
            roleIds.push(item.role_id)
          })
          this.form.roles = roleIds
          this.open = true
          this.title = '修改用户'
          delete this.form.password
        })
      },
      /** 重置密码按钮操作 */
      handleResetPwd(row) {
        this.$prompt('请输入"' + row.username + '"的新密码', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(({ value }) => {
          if (value.length < 6 || value.length > 20) {
            this.msgError('密码长度在 6 到 20 个字符')
            return
          }
          updateUser(row.user_id, { password: value }).then(response => {
            if (response.code === 200) {
              this.msgSuccess('修改成功，新密码是：' + value)
            }
          })
        }).catch(() => {
        })
      },
      /** 提交按钮 */
      submitForm: function() {
        this.$refs['form'].validate(valid => {
          if (valid) {
            if (this.form.user_id !== undefined) {
              delete this.form.avatar
              updateUser(this.form.user_id, this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess('修改成功')
                  this.open = false
                  this.getList()
                }
              })
            } else {
              addUser(this.form).then(response => {
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
        const user_id = row.user_id
        this.$confirm('是否确认删除用户编号为"' + user_id + '"的数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return delUser(user_id)
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
