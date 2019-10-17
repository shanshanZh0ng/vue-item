import Vue from 'vue'
import Router from 'vue-router'
import ApplicationCreate from '@/views/applicationCreator/ApplicationCreate'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'ApplicationCreate',
      component: ApplicationCreate
    }
  ]
})
