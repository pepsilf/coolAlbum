const Sunrise = getApp().sunrise

// const userDisableTip = "您的惠农账号已被禁用，如有疑问致电客服热线：400-0088688"

/**
 * 登录状态管理插件
 */
module.exports = {

  init(next) {
    this.getUserService().getUserId().then(res => {
      this.setData({
        myUserId: res
      })
      next()
    })
  },

  _onShow(next) {
    this.getUserService().getUserId().then(res => {
      this.setData({
        myUserId: res
      })
      next()
    })
  },

  getUserService() {
    if (!this.userService) {
      this.userService = Sunrise.context.getBean('@login')
    }
    return this.userService
  }

};