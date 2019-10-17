import * as types from './mutations-types'
const set = new Set([])

const mutations = {
  [types.SET_APPLICATION_NAME] (state, name) {
    state.application.name = name
  },
  [types.SET_DOMAIN_PORT] (state, name) {
    state.application.port = name
  },
  [types.SET_DOMAIN_PORTS] (state, name) {
    set.add(name)
    state.application.ports = [...set]
  }
}

export default mutations
