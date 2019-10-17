<template>
  <div class="application">
    <BaseConfig ref="baseConfig"></BaseConfig>
    <RuntimeEnv ref="runtime"></RuntimeEnv>
    <div class="margBot15 pad_t10">
      <i class="el-icon-s-management baseBlue"></i>
      <span>子域名和实例设置</span>
    </div>
    <div class="doamin">
      <el-card class="box-card">
        <el-form :model="ruleForm" :rules="rules" ref="domain" label-width="100px" class="demo-ruleForm">
          <el-form-item label="子域名" prop="host">
            <el-row class="left" style="width:80%">
              <el-col :span="14">
                <div class="center">
                  <el-input placeholder="请输入内容" v-model="ruleForm.host">
                    <template slot="prepend">Http://</template>
                    <!-- <template slot="append">{{reqDomains}}</template> -->
                  </el-input>
                </div>
              </el-col>
              <el-col class="center" :span="4">
                <div class="bg-purple-light">
                  <div class="lastInput center">
                    <el-select v-model="chooseDoamin" placeholder="请选择域名" @change="changeDoamin">
                      <el-option v-for="(item, index) in reqDomains" :label="item.name" :value="item.name" :key="index"></el-option>
                    </el-select>
                  </div>
                </div>
              </el-col>
              <el-col class="center" :span="4">
                <div class="bg-purple-light">
                  <div class="lastInput center">
                    <!-- {{$store.state.application.port}} -->
                    <el-select v-model="port" placeholder="请选择端口">
                      <el-option v-for="(item, index) in getPorts" :label="item" :value="item" :key="index"></el-option>
                    </el-select>
                  </div>
                </div>
              </el-col>
              <el-col style="width: 30px;">
                <el-tooltip effect="dark" content="提示文字" placement="right">
                  <i class="el-icon-question icon-q"></i>
                </el-tooltip>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="实例个数" prop="instances">
            <el-select v-model="ruleForm.instances" placeholder="请选择实例个数">
              <el-option label="1" value="1"></el-option>
              <el-option label="2" value="2"></el-option>
              <el-option label="3" value="3"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    <el-row class="mainBtnD">
      <el-button style="background:#dcdcdc;">取消</el-button>
      <el-button type="primary" @click="create">创建</el-button>
    </el-row>
  </div>
</template>

<script type="text/ecmascript-6">
import BaseConfig from './components/baseConfig/BaseConfig'
import RuntimeEnv from './components/runtimeEnvConfig/index'
import axios from 'axios'
import {validCodeName} from '@/views/applicationCreator/validators'
import {findComponentDownward} from '@/common/js/helpers.js'
import {getEnvironmentDomain} from 'api/axios.getData.js'

axios.defaults.baseURL = process.env.API_ROOT
var createData = {} // 创建的新数据集合

export default {
  name: 'ApplicationCreate',
  data () {
    return {
      domainGuid: '',
      reqDomains: '',
      chooseDoamin: [], // 2019.10.11
      port: '',
      ruleForm: {
        host: '',
        instances: ''
      },
      rules: {
        host: [
          { required: true, message: '请填写子域名', trigger: 'blur' },
          { validator: validCodeName, trigger: 'blur' }
        ],
        instances: [
          { required: true, message: '请选择实例个数', trigger: 'change' }
        ]
      }
    }
  },
  created () {
    this._getEnvironmentDomain() // 调用子域名接口
  },
  computed: {
    // 获取子域名端口下拉数据
    getPorts () {
      let ports = this.$store.state.application.ports.concat(this.$store.state.application.port)
      // eslint-disable-next-line
      this.port = ports[0]
      return new Set(ports)
    }
  },
  components: {
    BaseConfig,
    RuntimeEnv
  },
  methods: {
    // 改变域名的选择
    changeDoamin (name) {
      console.log(name)
      let reqDomains = this.reqDomains
      reqDomains.forEach(v => {
        if (v.name === name) {
          this.domainGuid = v.guid
        }
      })
    },
    // 获取子域名
    _getEnvironmentDomain () {
      getEnvironmentDomain().then(res => {
        let data = res.data
        if (data.code === 0) {
          this.reqDomains = data.list
          this.chooseDoamin = data.list[0].name
          this.domainGuid = data.list[0].guid
        }
      })
    },
    // 表单校验
    submitForm () {
      let flag = false
      this.$refs[`domain`].validate(valid => {
        if (valid) {
          flag = valid
          return true
        } else {
          return false
        }
      })
      return flag
    },
    // 获取选择配置项校验结果
    component () {
      let setting = findComponentDownward(this, 'Settings') // 获取环境设置子组件
      const flag = []
      setting.settings.forEach(v => {
        if (v.value) {
          let initData = findComponentDownward(this, `${v.alias}`)[`initial${v.alias}`]
          initData.forEach((val, index) => {
            if (val.isExpand) {
              findComponentDownward(this, `${v.alias}`).submitForm(index)
              let _flag = findComponentDownward(this, `${v.alias}`).submitForm(index)
              flag.push(_flag)
            }
          })
        }
      })
      if (flag.indexOf(false) === 0) {
        return false
      } else {
        return true
      }
    },
    // 点击创建
    create () {
      this.$refs.baseConfig.submitForm() // 调用基础设置子组件的校验规则
      let flag1 = this.$refs.baseConfig.submitForm()
      let activeTab = this.$refs.runtime.editableTabsValue // 获取运行环境设置的tab激活界面的value
      let tabContent = this.$refs.runtime.$children[1].$children[1] // tab切换所有的数据
      let activeContent // 定义tab切换当前激活的界面
      tabContent.$children.forEach(v => {
        if (v.name) {
          if (v.name === activeTab) {
            activeContent = v
          }
        }
      })
      this.$refs.runtime.formSubmit(activeContent)
      let flag2 = this.$refs.runtime.formSubmit(activeContent)
      this.submitForm() // 调用子域名和实例设置的校验规则
      let flag3 = this.submitForm()
      let isPaas = Boolean(flag1 && flag2 && flag3)
      if (isPaas) {
        this.$message({
          message: '保存成功！',
          type: 'success'
        })
        createData = this.dealData() // 调用处理数据与后台结构保持一致的方法
        console.log('创建的数据(全局变量createData)：', createData)
        // console.log('基础设置数据：', this.$refs.baseConfig.ruleForm, '运行环境设置数据：', this.$refs.runtime._data.editableTabs, `子域名：Http://${this.ruleForm.host}.${this.reqDomains}:${this.port} 实例数：${this.ruleForm.instances}`)
      } else {
        this.$message({
          message: '请按规则输入必填项！',
          type: 'warning'
        })
      }
    },
    // 处理创建成功后得到的数据，与后台数据结构保持一致
    dealData () {
      let baseData = this.$refs.baseConfig.ruleForm
      let runEnv = this.$refs.runtime._data.editableTabs
      let runEnvNum = runEnv.length
      var runList = new Set() // 运行环境tab切换数据容器
      for (let i = 0; i < runEnvNum; i++) {
        let tabs = this.$refs.runtime._data.editableTabs[i].form
        let tabData = {} // 运行环境单个tab容器

        // 存储
        // tabData.bindingStorages = tabs.storage
        let storages = tabs.storage
        let storageCur = []
        storages.forEach(v => {
          let _s = {}
          _s.name = v.name
          _s.mountPath = v.mountName // 挂载目录
          _s.capacity = v.resouceQuota
          _s.instance = v.optionValue
          _s.accessMode = v.accessAttributes === '读写' ? 'rw' : 'r'
          storageCur.push(_s)
        })
        tabData.bindingStorages = storageCur

        // 数据库
        // tabData.bindServiceInstances = tabs.database
        let database = tabs.database
        let databaseCur = []
        database.forEach(v => {
          let _d = {}
          if (v.resource === '套餐1：1/2/5') {
            _d.cpu = '1'
            _d.memory = '2'
            _d.storage = '5'
          } else if (v.resource === '套餐2：2/4/10') {
            _d.cpu = '2'
            _d.memory = '4'
            _d.storage = '10'
          }
          _d.name = v.name
          _d.serviceName = v.server
          _d.account = v.userName
          _d.password = v.password
          databaseCur.push(_d)
        })
        tabData.bindServiceInstances = databaseCur

        // 环境的参数
        // tabData.environment = tabs.environment
        tabData.image = tabs.environment.image
        tabData.imageVersion = tabs.environment.imageVersion
        tabData.cpu = tabs.environment.cpu
        tabData.memory = tabs.environment.memory
        tabData.ports = tabs.environment.ports
        tabData.ports = {
          portNumber: tabs.environment.ports[0].portNumber,
          protocol: tabs.environment.ports[0].protocol,
          extranetAccess: tabs.environment.ports[0].accessId
        }
        runList.add(tabData)
      }
      runList = [...runList]
      // console.log('运行环境数据：', runList)

      var total = {} // 所有数据的容器
      total.appClass = '0'
      total.name = baseData.name // 基础设置-应用名
      total.clusterGuid = baseData.clusterGuid // 基础设置-可用域
      total.host = this.ruleForm.host // 子域名-输入的前缀
      total.portNumber = this.port // 子域名-选择的端口
      total.domainGuid = this.domainGuid // 子域名-选择的域名guid
      total.instances = this.ruleForm.instances // 子域名实例数
      total.containers = runList
      return total
    }
  },
  watch: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.el-tabs--card>.el-tabs__header .el-tabs__item.is-active {
  border-top: 2px solid;
}
.el-checkbox.is-bordered.el-checkbox--medium .el-checkbox__label {
  font-size: 12px;
}
.el-button--small, .el-button--small.is-round {
  padding: 7px 15px;
}
.el-radio-button__orig-radio:checked+.el-radio-button__inner {
  background-color: #3f96ff;
  border-color: #3f96ff;
}
.el-form-item__label {
  font-size: 12px;
  line-height: 30px;
}
.el-checkbox.is-bordered.el-checkbox--medium {
  height: 30px;
}
/* .el-form-item {
  margin-bottom: 12px;
} */
.el-form-item__content {
  line-height: 30px;
}
.el-input__icon {
  line-height: 30px;
}
.el-input__inner {
  height: 30px;
}
.el-radio-button__inner {
  padding: 8px 20px;
}
.margBot15.pad_t10 span {
  font-size: 16px;
}
.application {
  padding-bottom: 60px;
  margin: 20px;
}
.lastInput {
  /* border: 1px solid #DCDFE6; */
  border-left:none;
  color:#909399;
  height:30px;
  line-height:30px;
  background:#F5F7FA;
}
.is-error .lastInput .el-input__inner{border: 1px solid #DCDFE6}
</style>
