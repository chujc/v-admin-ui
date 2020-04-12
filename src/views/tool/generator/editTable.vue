<template>
  <el-card>
    <el-tabs v-model="activeName">
      <el-tab-pane label="基本信息" name="basic">
        <basic-info-form ref="basicInfo" :info="info"/>
      </el-tab-pane>
      <el-tab-pane label="字段信息" name="field">
        <el-table :data="fieldns" :max-height="tableHeight">
          <el-table-column label="序号" type="index" min-width="5%"/>
          <el-table-column
            label="字段"
            prop="field_name"
            min-width="10%"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="字段名称"
            prop="field_comment"
            min-width="10%"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <el-input v-model="scope.row.field_comment"></el-input>
            </template>
          </el-table-column>
          <el-table-column
            label="数据库类型"
            prop="field_type"
            min-width="10%"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="创建" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox :true-label="1" :false-label=0 v-model="scope.row.is_insert"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="编辑" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox :true-label="1" :false-label=0 v-model="scope.row.is_edit"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="列表" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox :true-label="1" :false-label=0 v-model="scope.row.is_list"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="查询" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox :true-label="1" :false-label=0 v-model="scope.row.is_query"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="查询方式" min-width="10%">
            <template slot-scope="scope">
              <el-select v-model="scope.row.query_type">
                <el-option label="=" value="="/>
                <el-option label="!=" value="!="/>
                <el-option label=">" value=">"/>
                <el-option label=">=" value="<="/>
                <el-option label="<" value="<"/>
                <el-option label="<=" value="<="/>
                <el-option label="LIKE" value="LIKE"/>
                <el-option label="BETWEEN" value="BETWEEN"/>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="表单必填" min-width="5%">
            <template slot-scope="scope">
              <el-checkbox :true-label="1" :false-label=0 v-model="scope.row.is_required"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="显示类型" min-width="12%">
            <template slot-scope="scope">
              <el-select v-model="scope.row.html_type">
                <el-option label="文本框" value="input"/>
                <el-option label="文本域" value="textarea"/>
                <el-option label="富文本" value="richtext"/>
                <el-option label="下拉框" value="select"/>
                <el-option label="单选框" value="radio"/>
                <el-option label="多选框" value="checkbox"/>
                <el-option label="开关" value="switch"/>
                <el-option label="日期控件" value="datetime"/>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="字典类型" min-width="12%">
            <template slot-scope="scope">
              <el-select v-model="scope.row.dict_type" clearable filterable placeholder="请选择">
                <el-option
                  v-for="dict in dictOptions"
                  :key="dict.dict_type"
                  :label="dict.dict_name"
                  :value="dict.dict_type">
                  <span style="float: left">{{ dict.dict_name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ dict.dict_type }}</span>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <el-form label-width="100px">
      <el-form-item style="text-align: center;margin-left:-100px;margin-top:10px;">
        <el-button type="primary" @click="submitForm()">提交</el-button>
        <el-button @click="close()">返回</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script>
  import { getGeneratorTable, updateGeneratorTable } from '@/api/tool/generator'
  import { optionselect as getDictOptionselect } from '@/api/system/dict/type'
  import basicInfoForm from './basicInfoForm'

  export default {
    name: 'GeneratorTableEdit',
    components: {
      basicInfoForm
    },
    data() {
      return {
        // 选中选项卡的 name
        activeName: 'field',
        // 表格的高度
        tableHeight: document.documentElement.scrollHeight - 245 + 'px',
        // 表列信息
        fieldns: [],
        // 字典信息
        dictOptions: [],
        // 表详细信息
        info: {}
      }
    },
    beforeCreate() {
      const { table_id } = this.$route.query
      if (table_id) {
        // 获取表详细信息
        getGeneratorTable(table_id).then(res => {
          this.fieldns = res.data.data
          this.info = res.data.info
        })
        /** 查询字典下拉列表 */
        getDictOptionselect().then(response => {
          this.dictOptions = response.data
        })
      }
    },
    methods: {
      /** 提交按钮 */
      submitForm() {
        const basicForm = this.$refs.basicInfo.$refs.basicInfoForm
        Promise.all([basicForm
          //genForm
        ].map(this.getFormPromise)).then(res => {
          const validateResult = res.every(item => !!item)
          if (validateResult) {
            const genTable = Object.assign({}, basicForm.model)
            genTable.fields = this.fieldns
            genTable.params = {
              treeCode: genTable.treeCode,
              treeName: genTable.treeName,
              treeParentCode: genTable.treeParentCode
            }
            updateGeneratorTable(genTable).then(res => {
              this.msgSuccess(res.message)
              if (res.code === 200) {
                this.close()
              }
            })
          } else {
            this.msgError('表单校验未通过，请重新检查提交内容')
          }
        })
      },
      getFormPromise(form) {
        return new Promise(resolve => {
          form.validate(res => {
            resolve(res)
          })
        })
      },
      /** 关闭按钮 */
      close() {
        this.$store.dispatch('tagsView/delView', this.$route)
        this.$router.push({ path: '/tool/generator', query: { t: Date.now() } })
      }
    }
  }
</script>
