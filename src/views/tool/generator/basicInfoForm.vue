<template>
  <el-form ref="basicInfoForm" :model="info" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item label="表名称" prop="table_name">
          <el-input placeholder="请输入仓库名称" v-model="info.table_name"/>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="表描述" prop="table_comment">
          <el-input placeholder="请输入" v-model="info.table_comment"/>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="class_name">
           <span slot="label">
            控制器名称
            <el-tooltip content="如：UsersController" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <el-input placeholder="请输入" v-model="info.class_name"/>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="module_name">
            <span slot="label">
            模块名称
            <el-tooltip content="可以理解为Vue/View存放文件夹英文名与权限标识前缀，例如 system、shop、等" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <el-input placeholder="请输入" v-model="info.module_name"/>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="function_name">
            <span slot="label">
            功能名称
            <el-tooltip content="可理解vue文件夹与权限标识英文名，例如 config、user、role" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <el-input placeholder="请输入" v-model="info.function_name"/>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="作者" prop="function_author">
          <el-input placeholder="请输入" v-model="info.function_author"/>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="是否需要导出操作" prop="is_export">
          <el-switch v-model="info.is_export" :inactive-value=0 :active-value=1 />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="是否需要多选操作" prop="is_selection">
          <el-switch v-model="info.is_selection" :inactive-value=0 :active-value=1 />
        </el-form-item>
      </el-col>

      <el-col :span="24">
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" :rows="3" v-model="info.remark"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script>
  export default {
    name: 'BasicInfoForm',
    props: {
      info: {
        type: Object,
        default: null
      }
    },
    data() {
      return {
        rules: {
          table_name: [
            { required: true, message: '请输入表名称', trigger: 'blur' }
          ],
          table_comment: [
            { required: true, message: '请输入表描述', trigger: 'blur' }
          ],
          class_name: [
            { required: true, message: '请输入控制器名称', trigger: 'blur' }
          ],
          module_name: [
            { required: true, message: '请输入前端模块名称', trigger: 'blur' }
          ],
          function_name: [
            { required: true, message: '请输入前端功能名称', trigger: 'blur' }
          ],
          function_author: [
            { required: true, message: '请输入作者', trigger: 'blur' }
          ]
        }
      }
    }
  }
</script>
