<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="昵称" prop="nickname">
      <el-input v-model="user.nickname"/>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">保存</el-button>
      <el-button type="danger" size="mini" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
  import { updateAuthUser } from '@/api/login'

  export default {
    props: {
      user: {
        type: Object
      }
    },
    data() {
      return {
        // 表单校验
        rules: {
          nickname: [
            { required: true, message: '用户昵称不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      submit() {
        this.$refs['form'].validate(valid => {
          if (valid) {
            updateAuthUser({ nickname: this.user.nickname }).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
              }
            })
          }
        })
      },
      close() {
        this.$store.dispatch('tagsView/delView', this.$route)
        this.$router.push({ path: '/index' })
      }
    }
  }
</script>
