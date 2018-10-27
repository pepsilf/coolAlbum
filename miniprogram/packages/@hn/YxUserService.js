const Sunrise = getApp().sunrise;

/**
 * 优选用户相关接口
 */
class YxUserService extends Sunrise.Service {

  create() {
    this.yx = {}
  }

  // 在这个方法里面发请求，会处理登录态失效的问题
  request(func) {
    return this.login().then(() => {
      if (typeof func == 'function') {
        let result = func()
        if (result && result.catch) {
          return result.catch(err => {
            if (err.errorCode === 10001) { // 如果返回登录失效，就重新登录
              return this.login(true).then(() => {
                return this.request(func)
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
   * 查询是否已经注册
   * 
   * reLogin: 是否需要重新登录
   */
  login(reLogin) {
    if (!this.promiseLogin) {
      this.promiseLogin = new Promise((resolve, reject) => {
        this.get({
          isToastError: false,
          lock: 'yx-login',
          url: Sunrise.config.truffleApi + '/nsy/api/shareuser/unuser',
          data: () => {
            return {
              ticket: Sunrise.weapp.accessToken,
              appid: Sunrise.config.serviceName
            }
          }
        }).then(res => {
          if (res) {
            resolve()
          } else {
            this.yx.loginSuccess = resolve
            this.showRegisterDialog()
          }
        }).catch(err => {
          this.yx.loginSuccess = resolve
          this.showRegisterDialog()
        })
      })
    }

    return this.promiseLogin;
  }

  // 显示授权注册的dialog
  showRegisterDialog(retry) {
    Sunrise.$dialog({
      isClose: false,
      title: '请授权登录',
      selector: '#yx-login',
      message: retry ? '注册失败，请重试' : '第一次使用需要先授权登录哦~',
      showCancelButton: false,
      buttons: [{
        openType: 'getUserInfo',
        text: '授权登录'
      }]
    }).then(res => {
      this.register()
    })
  }

  // 注册用户
  register() {
    Sunrise.weapp.getUserInfo().then(res => {
      return this.post({
        lock: 'yx-register',
        url: Sunrise.config.truffleApi + '/nsy/api/shareuser/adduser',
        data: {
          nickName: Sunrise.weapp.userInfo.nickName,
          avatarUrl: Sunrise.weapp.userInfo.avatarUrl
        }
      }).then(res => {
        this.yx.loginSuccess()
      }).catch(err => {
        this.showRegisterDialog(true)
      })
    })
  }

}

module.exports = YxUserService;