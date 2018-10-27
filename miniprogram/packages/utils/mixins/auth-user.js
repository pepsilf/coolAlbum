const app = getApp();
import _ from '../attr.js';

module.exports = {

  init: function (next) {
    if (app.sunrise.phoneNumber) {
      this.phoneNumber = app.sunrise.phoneNumber;
    }
    if (!this.userInfo) {
      let _this = this
      app.sunrise.api.login({
        success: function () {
          wx.getSetting({
            success: res => {
              console.log("AuthUser - authSetting", res);
              if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                wx.getUserInfo({
                  success: result => {
                    _this.userInfo = result.userInfo;
                    // 每次拿到头像昵称，如果跟服务器的不一样，就更新
                    app.sunrise.api.registerUserInfo(result)
                    next();
                    console.log("AuthUser - UserInfo", _this.userInfo);
                  },
                  fail: () => {
                    next();
                  }
                })
              } else {
                _this.userInfo = null;
                next();
              }
            },
            fail: () => {
              next();
            }
          })
        }
      })
    }
    else {
      next();
    }
  },

  registerUserInfo: function (e) {
    this.userInfo = e.detail.userInfo;
    if (this.userInfo) {
      app.sunrise.api.registerUserInfo(e.detail)
    }
    console.log("AuthUser - UserInfo", this.userInfo);
    if (_.isFunction(this.onRegisterUserInfoCallback)) {
      this.onRegisterUserInfoCallback(e);
    }

  },

  registerPhoneNumber: function (e) {

    //this.phoneNumber = e.detail;
    app.sunrise.api.getPhoneNumber(e.detail, res => {
      console.log("AuthUser - registerPhoneNumber", res);
      this.phoneNumber = res.phoneNumber;
      if (_.isFunction(this.onRegisterPhoneNumberCallback)) {
        this.onRegisterPhoneNumberCallback();
      }
    })

    // console.log("AuthUser - registerPhoneNumber", e.detail);
    // if (_.isFunction(this.onRegisterPhoneNumberCallback)) {
    //   this.onRegisterPhoneNumberCallback();
    // }
  }

};