<template>
  <div class="margBot15">
    <div class="margBot15">
      <i class="el-icon-s-management baseBlue"></i>
      <span>基础设置</span>
      <el-tooltip effect="dark" content="提示文字" placement="right">
        <i class="el-icon-question icon-q"></i>
      </el-tooltip>
    </div>
    <el-card class="box-card">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="应用名称" prop="name">
          <el-input style="width: 60%;" v-model="ruleForm.name"></el-input>
          <span class="tip-text">名称为1-64个字符，只能包含数字、英文字符，或 “_”</span>
        </el-form-item>
        <el-form-item label="可用区" required>
          <el-radio-group v-model="ruleForm.clusterGuid">
            <el-radio-button v-for="item in list" :label="item.guid" :key="item.id">{{item.name}}</el-radio-button>
          </el-radio-group>
          <el-tooltip effect="dark" content="提示文字" placement="right">
            <i class="el-icon-question icon-q"></i>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import {getOptionalData} from 'api/axios.getData.js'

export default {
  name: 'BaseConfig',
  data () {
    let validCode = (rule, value, callback) => {
      let reg = /^[a-zA-Z0-9|_]{1,64}$/
      if (!reg.test(value)) {
        callback(new Error('名称为1-64个字符，只能包含数字、英文字符，或 “_”'))
      } else {
        // console.log(this.$store)
        this.$store.commit('SET_APPLICATION_NAME', value)
        callback()
      }
    }
    return {
      title: '基础设置',
      list: [],
      ruleForm: {
        name: '',
        clusterGuid: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入应用名称', trigger: 'blur' },
          { validator: validCode, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this._getList() // 调用接口
  },
  methods: {
    submitForm () {
      let flag = false
      this.$refs[`ruleForm`].validate(valid => {
        if (valid) {
          flag = valid
          return true
        } else {
          return false
        }
      })
      return flag
    },
    // 可用区数据获取
    _getList () {
      getOptionalData().then(res => {
        if (res.data.code === 0) {
          this.list = res.data.list
          this.ruleForm.clusterGuid = this.list[0].guid
        }
      })
    }
  },
  watch: {
    'ruleForm.name': function (val) {
      this.$store.commit('SET_APPLICATION_NAME', val)
    }
  }
}
</script>

<style scoped>
</style>
