<template>
    <div class="environment">
      <div class="margBot15 pad_t10">
        <i class="el-icon-s-management baseBlue"></i>
        <span>{{title}}</span>
      </div>
      <Card :cardName="cardName" :handleBtn="handleBtn" :nameIndex="$attrs.nameIndex">
        <el-tabs v-model="name" class="inlineBlock left" style="width:100%;">
          <el-tab-pane v-for="tab in tabs" :key="tab.id" :label="tab.label" :name="tab.name">
            <el-form label-width="100px" class="demo-ruleForm" :serverData="serverData" :model="serverData" :ref="`env${tab.name}`" :rules="rules">
              <el-form-item label="选择模板/镜像" required>
                <el-radio-group v-model="serverData.server">
                  <el-radio-button
                    :label="server.server"
                    v-for="server in serverData.tabData"
                    :key="server.server"
                  >{{server.server}}</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="选择版本" required>
                <el-radio-group v-model="serverData.version">
                  <el-radio-button
                    :label="version"
                    v-for="(version, index) in serverData.versions"
                    :key="index"
                  ></el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="资源配置" required>
                <el-radio-group v-model="serverData.resource" class="left">
                  <el-radio-button
                    :label="resource"
                    class="margin-r20 noradius border"
                    v-for="resource in resources"
                    :key="resource"
                  ></el-radio-button>
                </el-radio-group>
                <el-tooltip class="item" effect="dark" content="提示文字" placement="right">
                  <i class="el-icon-question icon-q"></i>
                </el-tooltip>
              </el-form-item>
              <div v-show="tab.name == 'mirrorTab' ? true : false">
                <el-col :span="6">
                  <el-form-item label="端口" prop="port">
                    <el-input v-model="serverData.port" placeholder="端口"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="协议">
                    <el-select v-model="serverData.accord" placeholder="请选择协议">
                      <el-option label="ALL" value="ALL"></el-option>
                      <el-option label="TCP" value="TCP"></el-option>
                      <el-option label="UDP" value="UDP"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="访问方式">
                    <el-select v-model="serverData.serverWay" placeholder="请选择服务">
                      <el-option label="外部服务" value="外部服务"></el-option>
                      <el-option label="内部服务" value="内部服务"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="3">
                  <el-form-item>
                    <el-button type="primary" size="small" @click="addPort">增加</el-button>
                  </el-form-item>
                </el-col>
              </div>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </Card>
    </div>
</template>

<script>
import Card from '@/components/card'
import {tabDatas} from '@/views/applicationCreator/initFormData'
// eslint-disable-next-line
import {cloneDeep} from 'lodash'
import {getEnvironmentTab, getEnvironmentResource} from 'api/axios.getData.js'

export default {
  props: {
    _initialEnvironment: {
      type: Object,
      // default: () => cloneDeep(tabDatas)
      default: () => {}
    }
  },
  name: 'Environment',
  data () {
    return {
      title: '环境设置',
      cardName: 'environment',
      handleBtn: false,
      name: 'runningTab',
      ports: [],
      serverData: {
        name: '',
        label: '',
        server: '',
        version: '',
        resource: '',
        domain: '',
        versions: [],
        resources: [],
        tabData: [],
        port: '',
        accord: '',
        serverWay: ''
      },
      resources: ['1核2G', '2核4G', '4核8G'],
      initialEnvironment: cloneDeep(tabDatas),
      initialTab: [],
      tabs: [{name: 'runningTab', label: '公共模板', id: 1}, {name: 'mirrorTab', label: '我的镜像', id: 2}],
      environmentEmitValue: {},
      rules: {
        port: [
          { required: true, message: '请输入端口', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    this.setEnvDefaultVal(`${this.name}`)

    this._getEnvironmentTab() // 调用tab切换数据接口
    this._getEnvironmentResource() // 调用资源配置接口
  },
  methods: {
    // 重新赋值
    setEnvDefaultVal (name) {
      this.serverData = this.initialEnvironment[name]
      const tabConten = this.serverData.tabData[0]
      if (!tabConten) {
        this.serverData.resource = this.resources[0]
        return false
      } else {
        this.serverData.server = tabConten.server
        this.serverData.versions = tabConten.versions
        this.serverData.resources = tabConten.resources
        // 设置版本和资源默认值
        this.serverData.version = tabConten.versions[0]
        this.serverData.resource = this.resources[0]
      }
    },

    // 过滤传给外面的表单值，只传外面需要的
    filterEmitValue (datas) {
      let image = ''
      let cpu = datas.resource[0]
      let memory = Number(cpu) * 2
      if (datas.name === 'runningTab') {
        image = `runtime/${datas.server}`
      } else {
        image = `image/${datas.server}`
      }
      let accessId = 1
      if (this.serverData.serverWay == undefined) { // eslint-disable-line
        accessId = ''
      }
      this.environmentEmitValue = {
        image: image,
        // name: datas.name,
        server: datas.server,
        imageVersion: datas.version,
        resource: datas.resource,
        cpu: cpu,
        memory: memory,
        ports: [{
          portNumber: this.serverData.port,
          protocol: this.serverData.accord,
          extranetAccess: this.serverData.serverWay,
          accessId: accessId
        }]
      }
      this.$emit('save-environment-config', this.environmentEmitValue)
    },
    // 表单校验
    submitForm (name) {
      let flag = false
      if (name === 'mirrorTab') {
        this.$refs[`env${name}`][0].validate(valid => {
          if (valid) {
            flag = valid
            return true
          } else {
            return false
          }
        })
        return flag
      } else {
        return true
      }
    },
    // 表单重置
    resetForm (name) {
      this.$refs[`env${name}`][0].resetFields()
    },
    // 我的镜像-增加端口
    addPort () {
      this.$store.commit('SET_DOMAIN_PORTS', this.serverData.port)
      this.serverData.port = this.serverData.port
      this.serverData.accord = this.serverData.accord
      this.serverData.serverWay = this.serverData.serverWay
      this.filterEmitValue(this.serverData)
      // console.log(this.$store.state.application.ports)
    },
    // 获取tab切换数据
    _getEnvironmentTab () {
      getEnvironmentTab().then(res => {
        let data = res.data
        if (data.code === 0) {
          const runData = []
          const mirrorData = []
          data.list.filter(val => {
            let name = val.name.split('/')
            let _i = name.length - 1
            val.server = name[_i]
            val.versions = val.tags
            val.port = Object.keys(val.ports)[0]
            val.domains = val.ports
            if (val.isPublic === 1) {
              runData.push(val)
            } else if (val.isPublic === 0) {
              mirrorData.push(val)
            }
          })
          this.initialEnvironment.runningTab.tabData = runData
          this.initialEnvironment.runningTab.server = runData[0].server ? runData[0].server : ''
          this.initialEnvironment.runningTab.version = runData[0].versions[0] ? runData[0].versions[0] : ''
          this.initialEnvironment.runningTab.versions = runData[0].versions ? runData[0].versions : []
          this.initialEnvironment.mirrorTab.tabData = mirrorData
        }
      })
    },
    // 获取资源配置数据
    _getEnvironmentResource () {
      getEnvironmentResource().then(res => {
        let data = res.data
        if (data.code === 0) {
          this.resources = []
          data.list.filter((val, i) => {
            this.resources.push(`${val.cpuNum}核${val.memoryNum}G`)
          })
        }
      })
    }
  },

  components: {
    Card
  },
  watch: {
    'name': function (val) {
      this.serverData = this.initialEnvironment[val]
      this.setEnvDefaultVal(val)

      this.resetForm('runningTab')
      this.resetForm('mirrorTab')
    },
    'serverData.server': function (val) {
      const tabData = this.serverData.tabData
      tabData.forEach((value, index) => {
        if (value.server === val) {
          this.serverData.version = value.versions[0]
          this.serverData.versions = value.versions

          this.$store.commit('SET_DOMAIN_PORT', value.port)
        }
      })

      // this.$emit('save-environment-config', this.serverData)
      this.filterEmitValue(this.serverData)
    },
    'serverData.version': function (val) {
      this.serverData.version = val

      // this.$emit('save-environment-config', this.serverData)
      this.filterEmitValue(this.serverData)
    },
    'serverData.resource': function (val) {
      this.serverData.resource = val

      // this.$emit('save-environment-config', this.serverData)
      this.filterEmitValue(this.serverData)
    }
  }
}
</script>

<style scoped>
.lastInput {
  border: 1px solid #DCDFE6;
  border-left:none;
  color:#909399;
  height:38px;
  line-height:38px;
  background:#F5F7FA;
}
</style>
