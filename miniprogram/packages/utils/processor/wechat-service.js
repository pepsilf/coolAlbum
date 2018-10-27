
module.exports = function (Sunrise) {

  class Wechat extends Sunrise.Service {


    getAccessToken(code) {
      return Sunrise.http2({
        url: Sunrise.config.baseApi + '/mini-program-api/user/login',
        data: { code },
      })
    }

    /**
     * 刷新 AccessToken 有效期 3天
     */
    refreshAccessToken() {
      return Sunrise.http2({
        url: Sunrise.config.baseApi + '/mini-program-api/user/refresh/token'
      })
    }
    
    /**
     * 登录后的业务处理
     */
    onLogin(accessToken) {
      console.log('onLogin', accessToken);
    }

    /**
     * 授权失败后的处理
     */
    onError(error) {

    }

    /**
     * 用户授权后的业务处理
     */
    onUserInfo(authData,userInfo) {
      console.log('onUserInfo', authData, userInfo);
    }


    // onRegister() {
    //   //console.log('onUserInfo', authData, userInfo);
    // }

  }
  
  return Wechat;
}
