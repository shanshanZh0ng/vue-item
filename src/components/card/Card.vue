<template>
<div class="card">
  <el-card class="box-card margBot15">
    <div slot="header" class="clearfix">
      <span >{{appName}}-{{cardName}}{{$parent.$attrs.nameIndex}}-{{cIndex}}</span>
      <span v-show="handleBtn">
        <el-tooltip
        effect="dark"
        content="清空"
        placement="top"
        >
        <i
            class="el-icon-circle-close iconSize pointer"
            @click="resetForm"
        ></i>
        </el-tooltip>
        <el-tooltip
        effect="dark"
        content="保存"
        placement="top"
        >
        <i
            class="el-icon-circle-check iconSize pointer"
            @click="submitForm"
        ></i>
        </el-tooltip>
      </span>
    </div>

    <div class="card-body">
      <slot></slot>
    </div>
  </el-card>
  <div></div>
</div>
</template>

<script>
export default {
  props: {
    // Cardtype: {
    //   type: String,
    //   require: true
    // },
    cardName: {
      type: String,
      default: ''
    },
    addBtn: {
      type: String,
      default: ''
    },
    handleBtn: {
      type: Boolean,
      default: true
    },
    nameIndex: {
      type: Number,
      default: 1
    },
    cIndex: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
      disabled: true
    }
  },
  computed: {
    appName () {
      return this.$store.state.application.name
    }
  },
  methods: {
    submitForm () {
      this.$emit('on-submit')
    },
    resetForm () {
      this.$emit('on-reset')
    },
    addForm () {
      this.$emit('on-add')
    }
  }
}
</script>

<style>
</style>
