<template>
  <div class="storage">
    <div class="margBot15 pad_t10">
      <i class="el-icon-s-management baseBlue"></i>
      <span>{{title}}</span>
    </div>
    <div v-for="(storage, index) in initialStorage" :key="index">
      <el-collapse-transition>
        <Card
          v-show="storage.isExpand"
          :cardName="cardName"
          :addBtn="addBtn"
          @on-submit="submitForm(index)"
          @on-reset="resetForm(index)"
          @on-add="addForm(index)"
          :nameIndex="$attrs.nameIndex"
          :cIndex="index+1"
        >
          <el-form
            :model="storage"
            :ref="`storage${index}`"
            :rules="rules"
            label-width="100px"
            class="demo-ruleForm"
          >
            <el-form-item
              label="挂载目录"
              prop="mountName"
            >
              <el-input
                style="width: 50%;"
                v-model="storage.mountName"
                placeholder="请输入挂载目录"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="资源配额"
              required
            >
              <el-radio-group style="margin-top:-40px;">
                <el-radio-button>自定义</el-radio-button>
              </el-radio-group>
              <el-slider
                v-bind:marks="marks"
                :max="maxQuata"
                class="slider"
                v-model.number="storage.resouceQuota"
              ></el-slider>
              <el-input
                style="width:50px;"
                v-model="storage.resouceQuota"
              ></el-input>{{storage.sliderUnit}}
            </el-form-item>
            <el-form-item
              label="副本数量"
              prop="optionValue"
            >
              <el-select
                v-model="storage.optionValue"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in storage.options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="访问属性"
              prop="accessAttributes"
              required
            >
              <el-radio
                v-model="storage.accessAttributes"
                label="读写"
              >读写</el-radio>
              <el-radio
                v-model="storage.accessAttributes"
                label="只读"
              >只读</el-radio>
              <el-tooltip
                class="item"
                effect="dark"
                content="提示文字"
                placement="right"
              >
                <i
                  class="el-icon-question icon-q"
                ></i>
              </el-tooltip>
            </el-form-item>
          </el-form>
        </Card>
      </el-collapse-transition>
      <div v-show="!storage.isExpand">
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
import {storageSchema} from '@/views/applicationCreator/initFormData'
import {getStorageResource} from 'api/axios.getData.js'
import {validCodeMount} from '@/views/applicationCreator/validators'

export default {
  props: {
    _initialStorage: {
      type: Array,
      default: () => []
    }
  },
  name: 'Storage',
  data () {
    return {
      title: '存储',
      cardName: 'storage',
      addBtn: '添加存储',
      isDisabled: true,
      maxQuata: 0, // 新增滑块最大值字段
      marks: {
        0: '存储',
        20: '20G'
      },
      rules: {
        mountName: [
          { required: true, message: '请输入挂载目录', trigger: 'blur' },
          { validator: validCodeMount, trigger: 'blur' }
        ],
        optionValue: [
          { required: true, message: '请选择副本数量', trigger: 'blur' }
        ]
      },
      storageSchema: cloneDeep(storageSchema),
      initialStorage: [], // 本地数据
      storageEmitValue: [],
      currentStore: 0
    }
  },
  created () {
    this._getStorageData() // 调用资源配额最大值接口
  },
  components: {
    Card
  },
  mounted () {
    this.setInitialStorage() // 创建
  },
  computed: {
    // 实时获取应用名称
    appName () {
      return this.$store.state.application.name
    }
  },
  methods: {
    // slider滑块的数值单位标记
    _marks (item) {
      const max = item
      return {
        0: `存储`,
        [max]: `${item}G`
      }
    },
    // 存储数据初始化
    setInitialStorage () {
      // 深度克隆schema 防止引用污染
      let cloned = _.cloneDeep(storageSchema) // eslint-disable-line
      cloned.name = `${this.appName}-${this.cardName}${this.$attrs.nameIndex}-${this.initialStorage.length}`
      // 存入初始化的数组
      this.initialStorage.push(cloned)
    },
    // 提交表单校验
    submitForm (index) {
      let flag = false
      this.$refs[`storage${index}`][0].validate(valid => {
        if (valid) {
          flag = valid
          const currentStore = this.initialStorage[index]
          this.isDisabled = false
          currentStore.isExpand = false
          currentStore.isChecked = true
          // console.log(this.appName)
          this.initialStorage.forEach((v, i) => {
            v.name = `${this.appName}-${this.cardName}${this.$attrs.nameIndex}-${i + 1}`
          })
          this.filterEmitValue(this.initialStorage) // 提交保存数据
          // this.$emit('save-storage-config', this.initialStorage)
        } else {
          this.initialStorage[index].isDisabled = true
          this.initialStorage[index].isChecked = false
          return false
        }
      })
      return flag
    },

    // 过滤传给外面的表单值，只传外面需要的
    filterEmitValue (datas) {
      this.storageEmitValue = []
      datas.forEach((data, index) => {
        const form = {
          name: data.name, // 名字
          mountName: data.mountName, // 挂载目录
          resouceQuota: data.resouceQuota, // 资源配额-存储
          optionValue: data.optionValue, // 副本数量
          accessAttributes: data.accessAttributes, // 访问属性
          isDisabled: data.isDisabled,
          isExpand: data.isExpand,
          isChecked: data.isChecked
        }

        this.storageEmitValue.push(form)
      })

      this.$emit('save-storage-config', this.storageEmitValue)
    },
    // 表单数据重置
    resetForm (index) {
      this.$refs[`storage${index}`][0].model.resouceQuota = 0

      this.$refs[`storage${index}`][0].resetFields()
      this.isDisabled = true
      this.isChecked = false

      this.filterEmitValue(this.initialStorage) // 提交保存数据
    },
    // 增加按钮
    addForm (index) {
      if (this._checked(this.initialStorage)) {
        this.setInitialStorage()
        this.isDisabled = true
      } else {
        this.tip()
      }
    },
    // 编辑按钮
    editForm (index) {
      let _checked = this._checked(this.initialStorage)

      if (_checked) {
        this.initialStorage[index].isExpand = true
        this.initialStorage[index].isChecked = false
        this.isDisabled = true
      } else {
        this.$message({
          type: 'warning',
          message: '请输入所有必填项并保存'
        })
      }
    },
    // 删除按钮
    deleteForm (index) {
      this.initialStorage.splice(index, 1)

      this.filterEmitValue(this.initialStorage) // 提交保存数据
    },
    // 检查是否全部通过校验
    _checked (_ch) {
      let checked = _ch[0].isChecked
      _ch.forEach((val, index) => {
        checked = checked && val.isChecked
      })

      return checked
    },
    // 获取资源配额最大值
    _getStorageData () {
      getStorageResource().then(res => {
        let data = res.data
        if (data.code === 0) {
          this.maxQuata = Number(data.storageResidualCapacity)
          this.marks = this._marks(this.maxQuata)
        } else {
          throw new Error('存储-资源配额接口操作异常')
        }
      })
    }
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
</style>
