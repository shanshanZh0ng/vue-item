<template>
  <div class="database">
    <div class="margBot15 pad_t10">
      <i class="el-icon-s-management baseBlue"></i>
      <span>{{title}}</span>
    </div>
    <div v-for="(database, index) in initialDatabase" :key="index">
      <el-collapse-transition>
        <Card
          v-show="database.isExpand"
          :cardName="cardName"
          :addBtn="addBtn"
          @on-submit="submitForm(index)"
          @on-reset="resetForm(index)"
          @on-add="addForm(index)"
          :nameIndex="$attrs.nameIndex"
          :cIndex="index+1"
        >
          <el-form
            :model="chooseTab"
            :rules="rules"
            :ref="`database${index}`"
            label-width="100px"
            class="demo-ruleForm"
          >
            <el-form-item label="镜像" required>
              <el-radio-group v-model="database.mirror" @change="mirrorChange">
                <el-radio-button
                  :label="mirror"
                  v-for="mirror in mirrors"
                  :key="mirror"
                >{{mirror}}</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label="资源配额"
              required
            >
              <el-radio-group>
                <el-radio-group v-model="database.resource">
                  <el-radio-button
                    :label="item"
                    v-for="(item, index) in resouceSets"
                    :key="index"
                  >{{item}}</el-radio-button>
                </el-radio-group>
              </el-radio-group>
              <el-tooltip class="item" effect="dark" content="套餐：CPU（核） /  内存（G） /  存储（G）" placement="right">
                <i class="el-icon-question icon-q"></i>
              </el-tooltip>
              <div style="color:red;">{{chooseTab.tip}}</div>
            </el-form-item>
            <el-form-item
              label="账号"
              prop="userName"
            >
              <el-input
                style="width: 50%;"
                :disabled="chooseTab.server === 'Cassandra'"
                v-model="chooseTab.userName"
                placeholder="请输入账号"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="密码"
              prop="password"
            >
              <el-input placeholder="请输入密码"
                v-model="chooseTab.password"
                :disabled="chooseTab.server === 'Cassandra'"
                show-password
                style="width: 50%;"
              ></el-input>
            </el-form-item>
          </el-form>
        </Card>
      </el-collapse-transition>
      <div v-show="!database.isExpand">
        <div class="smallForm">
          <span>{{appName}}-{{cardName}}{{$attrs.nameIndex}}-{{index+1}}</span>
          <el-tooltip effect="dark" content="删除" placement="top">
            <i class="el-icon-delete iconSize pointer" @click="deleteForm(index)"></i>
          </el-tooltip>
          <el-tooltip effect="dark" content="编辑" placement="top">
            <i class="el-icon-edit-outline iconSize pointer" @click="editForm(index)"></i>
          </el-tooltip>
        </div>
      </div>
    </div>
    <el-button
      v-show="addBtn"
      class="margBot15"
      type="primary"
      :disabled="isDisabled"
      @click="addForm"
    >{{addBtn}}</el-button>
  </div>
</template>

<script type="text/ecmascript-6">
import Card from '@/components/card'
// eslint-disable-next-line
import {cloneDeep} from 'lodash'
import {validCodeName, password} from '@/views/applicationCreator/validators'
import {databaseSchema} from '@/views/applicationCreator/initFormData'
import {getDatabaseResource, getEnvironmentTab, getDatabaseMirror} from 'api/axios.getData.js'

export default {
  props: {
    _initialDatabase: {
      type: Array,
      default: () => []
    }
  },
  name: 'Database',
  data () {
    return {
      title: '数据库',
      cardName: 'database',
      addBtn: '添加数据库',
      isDisabled: true,
      mirrors: ['MySQL单机版', 'MySQL集群版', 'Cassandra', 'PostgreSQL'],
      resouceSets: ['套餐1：1/2/5', '套餐2：2/4/10'],
      mirTabData: {
        'MySQL单机版': {
          server: 'Mysql5.7',
          rate: 1,
          tip: '',
          userName: '',
          password: '',
          id: 1
        },
        'MySQL集群版': {
          server: 'MySQL',
          rate: 2,
          tip: '该数据库包含2个实例，各项资源的实际占用量为上方配额的2倍',
          userName: '',
          password: '',
          id: 2
        },
        'Cassandra': {
          server: 'Cassandra',
          rate: 3,
          tip: '该数据库包含3个实例，各项资源的实际占用量为上方配额的3倍',
          userName: 'Cassandra',
          password: 'Cassandra1',
          id: 3
        },
        'PostgreSQL': {
          server: 'PostgreSQL',
          rate: 1,
          tip: '',
          userName: '',
          password: '',
          id: 4
        }
      },
      rules: {
        typeOption: [
          { required: true, message: '请选择镜像类别', trigger: 'blur' }
        ],
        versionsOption: [
          { required: true, message: '请选择镜像版本', trigger: 'blur' }
        ],
        userName: [
          { required: true, message: '请输入账号', trigger: 'blur' },
          { validator: validCodeName, trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 8, max: 16, validator: password, trigger: 'blur' }
        ]
      },
      initialDatabase: [], // 本地数据
      databaseEmitValue: [],
      tabData: [],
      mirror: '',
      tip: '',
      chooseTab: {
        server: 'Mysql5.7',
        rate: 1,
        tip: '',
        userName: '',
        password: ''
      }
    }
  },
  created () {
    // this._getDatabaseResource() // 调用资源配额接口
    // this._getDatabaseMirror() // 调用镜像和版本的接口
  },
  components: {
    Card
  },
  mounted () {
    this.setInitialDatabase() // 创建
  },
  computed: {
    // 实时获取应用名称
    appName () {
      return this.$store.state.application.name
    }
  },
  methods: {
    // 镜像选择的改变
    mirrorChange (name) {
      this.chooseTab = this.mirTabData[name]
    },
    // slider滑块数据单位标记
    marks (item) {
      const max = item.max
      return {
        0: `${item.name}`,
        [max]: `${item.max}`
      }
    },
    // 初始化数据
    setInitialDatabase () {
      // 深度克隆schema 防止引用污染
      let cloned = _.cloneDeep(databaseSchema) // eslint-disable-line
      cloned.name = ` ${this.appName}-${this.cardName}${this.$attrs.nameIndex}-${this.initialDatabase.length + 1}`

      // 存入初始化的数组
      this.initialDatabase.push(cloned)
    },
    // 表单校验
    submitForm (index) {
      if (typeof (index) === 'undefined') {
        return false
      } else {
        let flag = false
        this.$refs[`database${index}`][0].validate(valid => {
          if (valid) {
            flag = valid
            const currentStore = this.initialDatabase[index]
            this.isDisabled = false
            currentStore.isExpand = false
            currentStore.isChecked = true

            this.initialDatabase[index].server = this.chooseTab.server
            this.initialDatabase[index].userName = this.chooseTab.userName
            this.initialDatabase[index].password = this.chooseTab.password

            this.initialDatabase.forEach((v, i) => {
              v.name = `${this.appName}-${this.cardName}${this.$attrs.nameIndex}-${i + 1}`
            })

            // this.$emit('save-database-config', this.initialDatabase)
            this.filterEmitValue(this.initialDatabase) // 提交保存数据
          } else {
            this.initialDatabase[index].isDisabled = true
            this.initialDatabase[index].isChecked = false
            return false
          }
        })
        return flag
      }
    },

    // 过滤传给外面的表单值，只传外面需要的
    filterEmitValue (datas, index) {
      this.databaseEmitValue = []

      datas.forEach((data, index) => {
        const form = {
          name: data.name,
          isDisabled: data.isDisabled,
          isExpand: data.isExpand,
          userName: data.userName,
          password: data.password,
          isChecked: data.isChecked,
          mirror: data.mirror,
          server: data.server,
          resource: data.resource
        }

        this.databaseEmitValue.push(form)
      })

      this.$emit('save-database-config', this.databaseEmitValue)
    },
    // 表单数据重置
    resetForm (index) {
      this.$refs[`database${index}`][0].resetFields()
      this.isDisabled = true
      this.isChecked = false

      this.initialDatabase[index].server = 'Mysql5.7'
      this.initialDatabase[index].userName = ''
      this.initialDatabase[index].password = ''

      this.filterEmitValue(this.initialDatabase) // 提交保存数据
    },
    // 数据库新增按钮
    addForm (index) {
      this.setInitialDatabase()
      this.isDisabled = true

      this.mirrorChange('MySQL单机版')
    },
    // 数据库小窗口编辑按钮
    editForm (index) {
      let _checked = this._checked(this.initialDatabase)
      if (_checked) {
        this.initialDatabase[index].isExpand = true
        this.initialDatabase[index].isChecked = false

        this.chooseTab.server = this.initialDatabase[index].server
        this.chooseTab.userName = this.initialDatabase[index].userName
        this.chooseTab.password = this.initialDatabase[index].password

        this.isDisabled = true
      } else {
        this.$message({
          type: 'warning',
          message: '请输入所有必填项并保存'
        })
      }
    },
    // 数据库小窗口删除按钮
    deleteForm (index) {
      this.initialDatabase.splice(index, 1)

      this.filterEmitValue(this.initialDatabase) // 提交保存数据
    },
    // 检验是否全部通过校验
    _checked (_ch) {
      let checked = _ch[0].isChecked
      _ch.forEach((val, index) => {
        checked = checked && val.isChecked
      })

      return checked
    },

    // 获取数据库资源配额
    _getDatabaseResource () {
      getDatabaseResource().then(res => {
        let data = res.data
        if (data.code === 0) {
          this.sliderData[0].max = data.maxCpu
          this.sliderData[0].marks = this.marks(this.sliderData[0])
          this.sliderData[1].max = data.maxMemory
          this.sliderData[1].marks = this.marks(this.sliderData[1])
          this.sliderData[2].max = data.maxDisk
          this.sliderData[2].marks = this.marks(this.sliderData[2])
        }

        this.setInitialDatabase()
      })
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
          this.tabData = mirrorData
          this.mirror = mirrorData[0] ? mirrorData[0].server : ''
          this.version = mirrorData[0] ? runData[0].versions[0] : ''
          this.versions = mirrorData[0] ? runData[0].versions : []
        }
      })
    },
    // 获取镜像和版本的数据
    _getDatabaseMirror () {
      getDatabaseMirror().then(res => {
        let data = res.data
        if (data.code === 0) {
          const mirrorData = []
          data.list.filter(val => {
            let name = val.name
            val.server = name
            val.description = val.description
            mirrorData.push(val)
          })
          this.tabData = mirrorData
          this.mirror = mirrorData[0] ? mirrorData[0].server : ''
          this.description = mirrorData[0] ? mirrorData[0].description : ''
        }
      })
    }
  },
  watch: {

  }
}
</script>

<style lang="less" scoped>
  .smallForm {
    margin: 10px 0;
    padding: 10px;
    height: 20px;
    width: 300px;
    border: 1px solid #ccc;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  }

  .el-slider__marks-text{
    width: 40px !important;
  }
</style>
