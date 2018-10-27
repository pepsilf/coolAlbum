import Sunrise from './packages/index.js'

Sunrise.run('dev', {
  pointcuts: ['service/aop/MyAdvisor'],
  wechatOptions: {
    hasWechatLogin: true,
    hasWechatSetting: true,
    hasWechatUserInfo: true,
  },
  init: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    console.log('dev', this)
  }
})


