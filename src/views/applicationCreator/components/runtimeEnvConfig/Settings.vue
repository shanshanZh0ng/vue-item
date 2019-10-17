<template>
  <div class="settings">
    <el-row class="margBot15 pad_l16">
      <i class="el-icon-setting"></i>
      <span class="margR20 fontSize12">选择配置项</span>
        <el-checkbox
          v-for="item in settings"
          :key="item.name"
          :label="item"
          @change="handleChange"
          border
          v-model="item.value"
          size="medium"
        >{{item.name}}</el-checkbox>
      <i class="el-icon-info warnColor"></i>
      <span class="tip-text">根据实际情况，创建数据库或存储实例，系统会为您自动绑定应用。</span>
    </el-row>
  </div>
</template>

<script>
export default {
  props: {
    settings: {
      type: Array,
      default: () => [
        {name: '存储', value: false, id: 1, alias: 'Storage'},
        {name: '数据库', value: false, id: 2, alias: 'Database'}
      ]
    }
  },
  name: 'Settings',
  data () {
    return {
      checkValue: []
    }
  },
  methods: {
    handleChange (val) {
      let data = this._makeEmitData(this.settings)
      this.$emit('setting-change', data)
    },
    _makeEmitData (values) {
      const data = Object.create(null)

      this.settings.forEach(val => {
        let key = val.alias
        let value = val.value
        data[key] = value
      })
      return data
    }
  }
}
</script>

<style scoped>
.pad_l16 {
  padding-left: 16px;
}
.fontSize12{
  font-size: 12px;
}
.warnColor {
  color: #E6A23C;
}
</style>
