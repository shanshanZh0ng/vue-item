// 存储初始化数据
export const storageSchema = {
  name: '',
  mountName: '',
  resouceQuota: 0,
  max: 0,
  marks: {
    0: '存储'
  },
  sliderUnit: 'G',
  accessAttributes: '读写',
  options: [
    {
      value: '1',
      label: '1'
    },
    {
      value: '2',
      label: '2'
    },
    {
      value: '3',
      label: '3'
    }
  ],
  optionValue: '',
  isDisabled: true,
  isExpand: true,
  isChecked: false
}

// 数据库初始化数据
export const databaseSchema = {
  name: '',
  mirror: 'MySQL单机版',
  server: 'Mysql5.7',
  userName: '',
  password: '',
  resource: '套餐1：1/2/5',
  // sliderData: [
  //   { max: 0, defaultNum: 0, unit: '核', name: 'CPU', marks: {0: 'CPU'} },
  //   { max: 0, defaultNum: 0, unit: 'G', name: '内存', marks: {0: '内存'} },
  //   { max: 0, defaultNum: 0, unit: 'G', name: '存储', marks: {0: '存储'} }
  // ],
  isDisabled: true,
  isExpand: true,
  isChecked: false
}

// 环境设置模板/镜像tab切换数据
export const tabDatas = {
  runningTab: {
    name: 'runningTab',
    label: '公共模板',
    server: '',
    version: '',
    resource: '',
    // domain: '',
    versions: {},
    resources: {},
    domains: {},
    tabData: []
  },
  mirrorTab: {
    name: 'mirrorTab',
    label: '我的镜像',
    server: '',
    version: '',
    resource: '',
    // domain: '',
    versions: {},
    resources: {},
    domains: {},
    tabData: [],
    port: '',
    accord: 'ALL',
    serverWay: '外部服务'
  }
}
