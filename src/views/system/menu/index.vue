<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item label="菜单名称">
        <el-input
          v-model="queryParams.menu_name"
          placeholder="请输入菜单名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.is_visible" placeholder="菜单状态" clearable size="small">
          <el-option
            v-for="dict in visibleOptions"
            :key="parseInt(dict.dict_value)"
            :label="dict.dict_label"
            :value="parseInt(dict.dict_value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-has-permission="['admin.menus.store']">新增
        </el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="menuList"
      row-key="menu_id"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="menu_name" label="菜单名称" :show-overflow-tooltip="true"/>
      <el-table-column prop="icon" label="图标" align="center">
        <template slot-scope="scope">
          <svg-icon :icon-class="scope.row.icon"/>
        </template>
      </el-table-column>
      <el-table-column prop="order" label="排序" width="60"/>
      <el-table-column prop="permission" label="权限标识" :show-overflow-tooltip="true" width="240"/>
      <el-table-column prop="component" label="组件路径" :show-overflow-tooltip="true" width="240"/>
      <el-table-column prop="is_visible" label="可见" :formatter="is_visibleFormat" width="60"/>
      <el-table-column label="创建时间" align="center" prop="created_at" width="160"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="240">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-has-permission="['admin.menus.update']"
          >修改
          </el-button>
          <el-button
            v-if="scope.row.menu_type === 1"
            size="mini"
            type="primary"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-has-permission="['admin.menus.store']"
          >新增
          </el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-has-permission="['admin.menus.destroy']"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单">
              <tree-select
                v-model="form.parent_id"
                :options="menuOptions"
                :normalizer="normalizer"
                :show-count="true"
                placeholder="选择上级菜单"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="menu_type">
              <el-radio-group v-model="form.menu_type">
                <el-radio :label="1">菜单</el-radio>
                <el-radio :label="2">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="form.menu_type == 1" label="菜单图标">
              <el-popover
                placement="bottom-start"
                width="460"
                trigger="click"
                @show="$refs['iconSelect'].reset()"
              >
                <IconSelect ref="iconSelect" @selected="selected"/>
                <el-input slot="reference" v-model="form.icon" placeholder="点击选择图标" readonly>
                  <svg-icon
                    v-if="form.icon"
                    slot="prefix"
                    :icon-class="form.icon"
                    class="el-input__icon"
                    style="height: 32px;width: 16px;"
                  />
                  <i v-else slot="prefix" class="el-icon-search el-input__icon"/>
                </el-input>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menu_name">
              <el-input v-model="form.menu_name" placeholder="请输入菜单名称"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="order">
              <el-input-number v-model="form.order" controls-position="right" :min="0"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menu_type === 1" label="是否外链">
              <el-radio-group v-model="form.is_link">
                <el-radio :label=1>是</el-radio>
                <el-radio :label=0>否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menu_type === 1" label="路由地址" prop="path">
              <el-input v-model="form.path" placeholder="请输入路由地址"/>
            </el-form-item>
          </el-col>
          <el-col v-if="form.menu_type === 1" :span="12">
            <el-form-item label="组件路径" prop="component">
              <el-input v-model="form.component" placeholder="请输入组件路径"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menu_type" label="权限标识">
              <el-input v-model="form.permission" placeholder="请权限标识" maxlength="50"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="form.menu_type === 1" label="菜单状态">
              <el-radio-group v-model="form.is_visible">
                <el-radio
                  v-for="dict in visibleOptions"
                  :key="parseInt(dict.dict_value)"
                  :label="parseInt(dict.dict_value)"
                >{{ dict.dict_label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { listMenu, getMenu, delMenu, addMenu, updateMenu } from '@/api/system/menu'
  import TreeSelect from '@riophae/vue-treeselect'
  import '@riophae/vue-treeselect/dist/vue-treeselect.css'
  import IconSelect from '@/components/IconSelect'

  export default {
    name: 'Menu',
    components: { TreeSelect, IconSelect },
    data() {
      return {
        // 遮罩层
        loading: true,
        // 原始菜单数据
        originalMenuList: [],
        // 菜单表格树数据
        menuList: [],
        // 菜单树选项
        menuOptions: [],
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 菜单状态数据字典
        visibleOptions: [],
        // 查询参数
        queryParams: {
          menu_name: undefined,
          is_visible: undefined
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          parent_id: [
            { required: true, message: '请选择上级菜单', trigger: 'blur' }
          ],
          menu_name: [
            { required: true, message: '菜单名称不能为空', trigger: 'blur' }
          ],
          menu_type: [
            { required: true, message: '请选择菜单类型', trigger: 'blur' }
          ],
          order: [
            { required: true, message: '菜单顺序不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      this.getList()
      this.getDicts('system_menu_show').then(response => {
        this.visibleOptions = response.data
      })
    },
    methods: {
      // 选择图标
      selected(name) {
        this.form.icon = name
      },
      /** 查询菜单列表 */
      getList() {
        this.loading = true
        listMenu(this.queryParams).then(response => {
          this.originalMenuList = response.data
          if (this.queryParams.menu_name || this.queryParams.is_visible) {
            this.menuList = response.data
          } else {
            this.menuList = this.handleTree(response.data, 'menu_id', 'parent_id')
          }
          this.loading = false
        })
      },
      /** 转换菜单数据结构 */
      normalizer(node) {
        if (node.children && !node.children.length) {
          delete node.children
        }
        return {
          id: node.menu_id,
          label: node.menu_name,
          children: node.children
        }
      },
      /** 查询菜单下拉树结构 */
      getTreeSelect() {
        this.menuOptions = []
        const menu = { menu_id: 0, menu_name: '主菜单', children: [] }
        menu.children = this.handleMenuTree(this.originalMenuList, 'menu_id', 'parent_id')
        this.menuOptions.push(menu)
      },
      // 菜单显示状态字典翻译
      is_visibleFormat(row, column) {
        if (row.menu_type === 2) {
          return ''
        }
        return this.selectDictLabel(this.visibleOptions, row.is_visible)
      },
      // 取消按钮
      cancel() {
        this.open = false
        this.reset()
      },
      // 表单重置
      reset() {
        this.form = {
          menu_id: undefined,
          parent_id: 0,
          menu_name: undefined,
          icon: undefined,
          menu_type: 1,
          order: 0,
          is_link: 0,
          is_visible: 1
        }
        this.resetForm('form')
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.getList()
      },
      /** 新增按钮操作 */
      handleAdd(row) {
        this.reset()
        this.getTreeSelect()
        if (row != null) {
          this.form.parent_id = row.menu_id
        }
        this.open = true
        this.title = '添加菜单'
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset()
        this.getTreeSelect()
        getMenu(row.menu_id).then(response => {
          this.form = response.data
          this.open = true
          this.title = '修改菜单'
        })
      },
      /** 提交按钮 */
      submitForm: function() {
        this.$refs['form'].validate(valid => {
          if (valid) {
            if (this.form.menu_id !== undefined) {
              updateMenu(this.form.menu_id, this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess('修改成功')
                  this.open = false
                  this.getList()
                }
              })
            } else {
              addMenu(this.form).then(response => {
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
        this.$confirm('是否确认删除名称为"' + row.menu_name + '"的数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return delMenu(row.menu_id)
        }).then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        }).catch(function() {
        })
      },
      handleMenuTree(data, id, parentId, children, rootId) {
        id = id || 'id'
        parentId = parentId || 'parentId'
        children = children || 'children'
        rootId = rootId || 0
        // 对源数据深度克隆
        const cloneData = JSON.parse(JSON.stringify(data))
        // 循环所有项
        const treeData = cloneData.filter(father => {
          const branchArr = cloneData.filter(child => {
            if (child['menu_type'] === 1) {
              // 返回每一项的子级数组
              return father[id] === child[parentId]
            }
          })
          branchArr.length > 0 ? father.children = branchArr : ''
          // 返回第一层
          return father[parentId] === rootId
        })
        return treeData !== '' ? treeData : data
      }
    }
  }
</script>
