const Sunrise = getApp().sunrise;
const HN_TICKET_EXPIRE = 3600000 * 24 * 90 // 第三方登录返回的ticket有效期是90天

/**
 * 处理惠农网登录等逻辑
 */
class HnUserService extends Sunrise.Service {

  create() {
    this.auth = Sunrise.context.getBean('$$AuthService')
    Sunrise.hn = {}
  }

  /**
   * 获取我的hnUserId
   * 
   * force: 是否必须拿到userId
   */
  getUserId(force) {
    return this.hnLogin(force).then(res => {
      return res.userInfo.hnUserId
    }).catch(err => {
      return 0
    })
  }

  /**
   * 获取我的ticket
   */
  getUserTicket(needLogin = true) {
    return this.hnLogin(needLogin).then(res => {
      return res.loginInfo.ticket
    }).catch(err => {
      return ''
    })
  }

  /**
   * 使用这个方法发送的请求会捕获登录态异常，并重新发送请求
   */
  hnRequest(func, needLogin = true) {
    return this.getUserTicket(needLogin).then(ticket => {
      if (typeof func == 'function') {
        if (needLogin && !ticket) {
          return Promise.reject()
        }
        let result = func(ticket)
        if (result && result.catch) {
          return result.catch(err => {
            if (err.errorCode === 500101) { // 如果返回登录失败，就重新登录
              return this.hnLogin(true, true).then(() => {
                return this.hnRequest(func)
              })
            } else {
              return Promise.reject(err)
            }
          })
        } else {
          return result
        }
      } else {
        return func
      }
    })
  }

  /**
   * 惠农网登录
   * 
   * force: true为必须登录，如果登录失败则弹出授权窗以及登录页面
   * reLogin: 是否重新登录
   */
  hnLogin(force, reLogin) {
    if (Sunrise.hn.loginInfo && Sunrise.hn.userInfo && !reLogin) {
      return this.resolve(Sunrise.hn)
    }
    if (Sunrise.hn.isBanned) {
      wx.showToast({
        title: '您的账号已被禁用',
        icon: 'none'
      })
      return Promise.reject()
    }
    if (Sunrise.hn.loginFail && !force) {
      return Promise.reject()
    }
    return new Promise((resolve, reject) => {
      let navigateToLogin = () => {
        wx.navigateTo({
          url: '/pages/login/index'
        })
        Sunrise.loginSuccessCallback = () => {
          resolve(Sunrise.hn)
        }
      }
      if (force && Sunrise.hn.loginFail) {
        navigateToLogin()
        return
      }
      let req = (auth) => {
        this.post({
          lock: 'hn-login',
          loading: true,
          isToastError: false,
          url: Sunrise.config.baseApi + '/mini-program-api/hnwuser/login',
          data: auth ? {
            signature: auth.signature,
            rawData: auth.rawData,
            encryptedData: auth.encryptedData,
            iv: auth.iv
          } : {}
        }).then(data => {
          Sunrise.hn = data
          resolve(data)
        }).catch(err => {

          /**
           * 用户被禁用
           */
          if (err.errorCode == 711007) {
            wx.showToast({
              title: err.message,
              icon: 'none'
            })
            Sunrise.hn.isBanned = true
            reject(err)
            return
          }
          if (force) { // 如果必须登录，先弹出登录页面走登录流程
            navigateToLogin()
          } else {
            Sunrise.hn.loginFail = true
            reject(err)
          }
        })
      }
      this.auth.getUserInfo().then(auth => {
        req(auth)
      }).catch(err => {
        // 授不授权都发请求
        req()
      })
    })
  }

  /**
   * 发送短信验证码
   * 
   * mobile: 手机号
   */
  sendCode(mobile) {
    return this.post({
      url: Sunrise.config.bananaApi + "/user/access/send/login/sms",
      noLogin: true,
      data: {
        mobile: mobile,
        from: 1,
        deviceNo: Sunrise.util.getDeviceId(),
        sourceChannel: 2
      }
    })
  }

  /**
   * 拨打400电话
   * 
   * hnUserId: 被叫方用户id
   * businessType: 业务类型  1 供应详情 2 采购详情 3 店铺详情 4 买家订单 5 卖家订单 6 收到的报价详情 7 购物车 8 免费卖家承载页 9 代卖 10 退款 11 评论 12 店铺流量 13 商机推送 14 发出的报价详情页 15 通话记录 16 IM 17 合伙人 20 动态详情 22 小程序默认
   */
  call(toHnUserId, businessType) {
    return this.hnRequest(ticket => {
      return this.post({
        isToastError: false,
        url: Sunrise.config.baseApi + "/banana/im/operate/wechatcall", // 新接口
        data: {
          ticket: ticket,
          toHnUserId: toHnUserId,
          businessType: businessType || 22, // 小程序
          sourceFrom: 7, // 微信 
        }
      })
    })
  }

  /**
   * 注册登录
   * 
   * mobile: 手机号
   * code: 验证码
   */
  register(mobile, code) {
    return this.auth.getUserInfo().then(auth => {
      return this.post({
        url: Sunrise.config.baseApi + "/mini-program-api/hnwuser/signin",
        contentType: "json",
        noLogin: true,
        loading: true,
        data: {
          mobile: mobile,
          code: code,
          regChannel: 1,
          regFrom: 9,
          signature: auth.signature,
          rawData: auth.rawData,
          encryptedData: auth.encryptedData,
          iv: auth.iv
        }
      }).then(res => {
        Sunrise.hn = res
        return res
      })
    })
  }

}

module.exports = HnUserService;