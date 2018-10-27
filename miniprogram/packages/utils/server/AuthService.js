const Sunrise = getApp().sunrise;

class AuthService extends Sunrise.Service {

  init() {}

  /**
   * 获取用户信息
   */
  getUserInfo() {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            Sunrise.http.login({ // 如果已授权了，检查登录态，然后获取用户信息
              success: () => {
                wx.getUserInfo({
                  withCredentials: true,
                  success: result => {
                    resolve(result)
                  },
                  fail: err => {
                    reject(err)
                  }
                })
              },
              fail: err => {
                reject(err)
              }
            })
          } else {
            reject()
          }
        },
        fail: err => {
          reject(err)
        }
      })
    })
  }

}

module.exports = AuthService;