<template>
  <div class="env-main">
    <div class="margBot15 pad_t10">
      <i class="el-icon-s-management baseBlue"></i>
      <span>运行环境设置</span>
      <el-tooltip class="item" effect="dark" content="提示文字" placement="right">
        <i class="el-icon-question icon-q"></i>
      </el-tooltip>
    </div>
    <el-card class="box-card">
      <div class="title">
        <el-button
          size="small"
          @click="addTab(editableTabsValue)"
        >
          添加运行环境
        </el-button>
      </div>
      <el-tabs v-model="editableTabsValue" type="card" closable @tab-remove="removeTab" :before-leave="beforeLeave">
        <el-tab-pane
          :ref="`tabs${tab.name}`"
          :key="tab.name"
          v-for="(tab, index) in editableTabs"
          :label="`${appName}-${tab.name}`"
          :name="tab.name"
        >
          <Settings @setting-change="(val) => settingChange(val, tab)" ref="settings"></Settings>
          <Storage :nameIndex="index+1" v-show="tab.isStorageShow" ref="storage" @save-storage-config="(val) => storageSave(val, tab)"></Storage>
          <DataBase :nameIndex="index+1"  v-show="tab.isDatabaseShow" ref="database" @save-database-config="(val) => databaseSave(val, tab)"></DataBase>
          <Environment :nameIndex="index+1" ref="environment" @save-environment-config="(val) => environmentSave(val, tab)"></Environment>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import Settings from './Settings'
import DataBase from './Database'
import Storage from './Storage'
import Environment from './Environment'

export default {
  name: 'RuntimeEnv',
  props: {
    _editableTabs: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      editableTabsValue: '1',
      editableTabs: [{
        // title: '',
        name: '1',
        isStorageShow: false,
        isDatabaseShow: false,
        form: {
          storage: [],
          database: [],
          environment: {}
        }
      }],
      tabIndex: 1
    }
  },
  components: {
    Settings,
    DataBase,
    Storage,
    Environment
  },
  computed: {
    appName () {
      return this.$store.state.application.name
    }
  },
  methods: {
    storageSave (val, tab) {
      tab.form.storage = val
    },

    databaseSave (val, tab) {
      tab.form.database = val
    },

    environmentSave (val, tab) {
      tab.form.environment = val
    },

    settingChange (val, tab) {
      tab.isStorageShow = val.Storage
      tab.isDatabaseShow = val.Database
    },

    addTab (targetName) {
      let _name = `tabs${targetName}`
      let _activeTab = this.$refs[_name][0]
      this.formSubmit(_activeTab)
      if (this.formSubmit(_activeTab)) {
        let newTabName = ++this.tabIndex + ''
        this.editableTabs.push({
          title: `${this.appName}-${newTabName}`,
          name: newTabName,
          isStorageShow: false,
          isDatabaseShow: false,
          form: {
            storage: [],
            database: [],
            environment: {}
          }
        })
        this.editableTabsValue = newTabName
      } else {
        this.$message({
          message: '请按规则输入必填项！',
          type: 'warning'
        })
        this.editableTabsValue = targetName
      }
    },

    removeTab (targetName) {
      let tabs = this.editableTabs
      let activeName = this.editableTabsValue
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            let nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            }
          }
        })
      }
      this.editableTabsValue = activeName
      this.editableTabs = tabs.filter(tab => tab.name !== targetName)
    },

    formSubmit (item) {
      let itemChildren = item.$children
      let envir = itemChildren[3] // 获取运行环境设置组件
      let envName = envir.name // 获取环境设置组件tab切换选择的name
      envir.submitForm(envName) // 调用环境设置组件的校验规则
      let flag2 = envir.submitForm(envName)
      this.component(itemChildren) // 调用存储和数据库是否校验的方法
      let flag3 = this.component(itemChildren)
      let isPaas = Boolean(flag2 && flag3)
      return isPaas
    },
    // 检验存储和数据库两个模块是否都通过校验
    component (itemChildren) {
      let set = itemChildren[0] // 获取运行环境设置配置项组件
      let _settings = set.settings
      let _storage = itemChildren[1] // 获取运行环境存储组件
      let _database = itemChildren[2] // 获取运行环境数据库项组件
      const flag = []
      // console.log(_settings)
      _settings.forEach(v => {
        if (v.value) {
          if (v.alias === 'Storage') {
            let initData = _storage[`initial${v.alias}`]
            initData.forEach((val, index) => {
              if (val.isExpand) {
                _storage.submitForm(index)
                let _flag = _storage.submitForm(index)
                flag.push(_flag)
              }
            })
          } else if (v.alias === 'Database') {
            let initData = _database[`initial${v.alias}`]
            // console.log(initData)
            initData.forEach((val, index) => {
              if (val.isExpand) {
                _database.submitForm(index)
                let _flag = _database.submitForm(index)
                flag.push(_flag)
              }
            })
          }
        }
      })

      if (flag.indexOf(false) === 0) {
        return false
      } else {
        return true
      }
    },
    // tab离开当前页进行校验，不通过不允许离开
    beforeLeave (item, old) {
      let tabs = this.editableTabs // tabs所有的页签
      let isForm = false // tab页签改变判断是否因删除tab所导致，true表示需要校验
      tabs.forEach((tab, index) => {
        if (tab.name === old) {
          isForm = true
        }
      })
      if (isForm) {
        let _name = `tabs${old}`
        let _activeTab = this.$refs[_name][0] // 当前激活状态的tab页
        this.formSubmit(_activeTab)
        if (!this.formSubmit(_activeTab)) {
          this.editableTabsValue = old
          this.$message({
            message: '请按规则输入必填项！',
            type: 'warning'
          })
          return false
        }
      }
    }
  }
}
</script>

<style scoped>
</style>
