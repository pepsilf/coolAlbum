

import dateUtil from './date.js';

module.exports = function(Sunrise) {

    const _ = Sunrise._;
    const SettingScope = {
      'scope.writePhotosAlbum' : 'hasWritePhotosAlbum',
      'scope.userLocation': 'hasUserLocation',
      'scope.address': 'hasAddress',
      'scope.invoiceTitle': 'hasInvoiceTitle',
      'scope.camera': 'hasCamera',
      'scope.werun': 'hasWerun',
      'scope.record': 'hasRecord'
    }

    /**
     * 登录失效时间
     * 2天18小时
     */
    const TOKEN_EXPIRE = '2d18h';
    const SR_LOGIN_TOKEN = 'SR_LOGIN_TOKEN';


    /**
     * 下一次检查登录失效时间
     */
    let _checkSessionTime = 0;



    class Weapp {

        constructor() {
          
          this.setting = {
            hasUserInfo: false,
            hasUserLocation:false,
            hasAddress: false,
            hasInvoiceTitle: false,
            hasWerun: false,
            hasRecord: false,
            hasWritePhotosAlbum: false,
            hasCamera: false,
          }

          this._hasLoadWechatServiceComplete = false;
          this._hasSettingComplete = false;
          this.userInfo = {};
          this.user = {};
          this.authData = {};
        }

        init() {
          let wechatOptions = Sunrise.config.wechatOptions || {};
          if (!this._hasLoadWechatServiceComplete && wechatOptions.service) {
              this._hasLoadWechatServiceComplete = true;
              let path = ['../../'].concat(wechatOptions.service).join('');
              let WechatClass = require(path)(Sunrise);
              let wechatService = new WechatClass();
              if (wechatService instanceof Sunrise.Wechat) {
                this.service = wechatService;
                this.service.init();
                Sunrise.logger.debug('微信服务接口初始化完成！！ ')
              }
          }

          return this.doAuthorize().then(res => {
            if (wechatOptions.hasWechatSetting) {
              if (this._hasSettingComplete) {
                return this.getUserInfo().then(() => {
                  return this.doRegister();
                });
              }
              else {
                return this.getSetting().then(() => {
                  if (wechatOptions.hasWechatUserInfo) {
                    return this.getUserInfo().then(() => {
                      return this.doRegister();
                    });
                  }
                  return Promise.resolve();
                })
              }
            }
            return Promise.resolve();
          }) 
        }

        registerUserInfo(res) {
          
          if (res.userInfo && _.isEmptyObject(this.userInfo)) {
            this.setting.hasUserInfo = true;
            this.authData = {
              signature: res.signature,
              rawData: res.rawData,
              encryptedData: res.encryptedData,
              iv: res.iv
            }
            this.userInfo = res.userInfo;
            this.doRegister();
            Sunrise.event.fire('$wechatAuth', [res.userInfo]);

            Sunrise.logger.debug('用户许可微信授权信息，weapp.userInfo 生效！！')
            return true;
          }
          return this.setting.hasUserInfo;
        }

        registerUserPhonenumber(res) {
          if (res) {
            return true;
          }
          return false;
        }

        getSetting() {

          if (!this._settingPromise) {
               Sunrise.logger.debug('正在读取微信配置 wx.getSetting....')
               this._settingPromise =  new Promise((resolve, reject) => {
                  wx.getSetting({
                    success: res => {
                      var setting = {};
                      /**
                       * 用户信息
                       */
                      if (res.authSetting['scope.userInfo']) {
                        setting.hasUserInfo = true;
                      }
                      /**
                       * 地理位置
                       */
                      if (res.authSetting['scope.userLocation']) {
                        setting.hasUserLocation = true;
                      }
                      /**
                       * 通讯地址
                       */
                      if (res.authSetting['scope.address']) {
                        setting.hasAddress = true;
                      }
                      /**
                       * 发票抬头
                       */
                      if (res.authSetting['scope.invoiceTitle']) {
                        setting.hasInvoiceTitle = true;
                      }
                      /**
                       * 微信步数
                       */
                      if (res.authSetting['scope.werun']) {
                        setting.hasWerun = true;
                      }

                      /**
                       * 录音功能
                       */
                      if (res.authSetting['scope.record']) {
                        setting.hasRecord= true;
                      }

                      /**
                       * 保存到相册
                       */
                      if (res.authSetting['scope.writePhotosAlbum']) {
                        setting.hasWritePhotosAlbum = true;
                      }

                      /**
                       * 摄像头
                       */
                      if (res.authSetting['scope.camera']) {
                        setting.hasCamera = true;
                      }

                      this.setting = _.apply(this.setting, setting);
                      this._hasSettingComplete = true;
                      resolve(setting);
                      Sunrise.logger.debug('读取微信配置 wx.getSetting 完成！！ ', this.setting)
                      //this._settingPromise = null;
                    },
                  })
                });
          }
          return this._settingPromise
      }

      /**
       * 获得用户信息
       */
      getUserInfo() {
        if (_.isEmptyObject(this.userInfo)) {
          if (!this.setting.hasUserInfo) {
            Sunrise.logger.error('微信用户未允许授权，不能调用 wx.getUserInfo，请使用授权组件auth，进行授权！！ ')
          }
          else {
            if(!this._userInfoPromise) {
                this._userInfoPromise = new Promise((resolve, reject) => {
                wx.getUserInfo({
                  success: res => {
                    this.registerUserInfo(res);
                    resolve(res);
                    this._userInfoPromise = null;
                    Sunrise.logger.debug('读取微信用户 wx.getUserInfo 授权信息完成！！ ')
                  },
                  fail: error => {
                    reject(error);
                  }
                })
              });
            }
            return this._userInfoPromise;
          }
        }
        return Promise.resolve();
      }

      // 获取用户位置信息
      getLocation() {
        return new Promise((resolve, reject) => {
          wx.getLocation({
            success: res => {
              resolve(res)
            },
            fail: error => {
              reject(error);
            }
          })
        });
      }
      
      /**
       *  微信授权
       */
      doAuth(scope) {
        return new Promise((resolve, reject) => {
          let field = SettingScope[scope];
          if (this.setting[field]) {
            resolve();
          } else {
            wx.getSetting({
              success: r => {
                //console.log('authSetting',r.authSetting);
                if (!r.authSetting[scope]) {
                  // 如果有记录但是为false，就是曾经弹过授权框
                  if (r.authSetting[scope] === false) {
                    wx.openSetting({
                      success: data => {
                        // this.setting[field] = true;
                        this.setting[field] = data.authSetting[scope];
                        resolve();
                      }
                    });
                  } else {
                    wx.authorize({
                      scope: scope,
                      success: res => {
                        this.setting[field] = true;
                        resolve(true);
                      },
                      fail: err => {
                        resolve();
                      }
                    })
                  }
                } else {
                  this.setting[field] = true;
                  resolve();
                }
              }
            });
          }

        });
      }

      /**
       * 登录
       */
      login() {
        return new Promise((resolve, reject) => {
          wx.login({
            success: res => {
              resolve(res);
            },
            fail: error => {
              reject(error);
            }
          })
        });
      }

      /**
       * 登录获取 AccessToken 
       * 
       */
      getAccessToken(code) {
        return Sunrise.http2({
          url: Sunrise.config.baseApi + '/mini-program-api/user/login',
          data: { code },
        })
      }

      /**
       * 刷新 AccessToken 有效期 3天
       */
      refreshAccessToken(token) {

        if (token) {
          this.accessToken = token;
          return Promise.resolve();
        }

        return Sunrise.http2({
          url: Sunrise.config.baseApi + '/mini-program-api/user/refresh/token'
        }).then(res => {
          this.accessToken = res;

          Sunrise.logger.debug('Tocken过期，刷新成功 Token:', res)
          Sunrise.store.set(SR_LOGIN_TOKEN, this.accessToken, TOKEN_EXPIRE);
          return res;
        })
      }

      /**
       * 检查登录是否失效
       */
      checkSession() {
        return new Promise((resolve, reject) => {
          wx.checkSession({
            success: res => {
              resolve(res);
            },
            fail: error => {
              reject(error);
            }
          })
        });
      }


      /**
       * 登录获取Token
       */
      doLogin() {
        if (!this._loginPromise) {
          Sunrise.logger.debug(`正在登录微信....`)
          this._loginPromise = this.login().then(res => {


            Sunrise.logger.debug(`微信登录成功，正在请求后台服务授权Token....`)
            return this.getAccessToken(res.code).then(token => {

              Sunrise.store.set(SR_LOGIN_TOKEN, token, TOKEN_EXPIRE);

              this.accessToken = token;
              this.service && this.service.onLogin(token);
              this._loginPromise = null;
              Sunrise.logger.debug(`服务授权成功！获取Tocken: ${token}`)
            }).catch(error => {
              wx.showToast({
                title: error ? error.message : '网络请求失败！',
                icon: 'none'
              })
            })
          })
        }
        return this._loginPromise;
      }

      doRegister() {
        if (this.service) {
          if (_.isEmptyObject(this.user)) {
            /**
             * 必须用户授权后，才调用外部服务接口
             */
            if (this.setting.hasUserInfo && !this._registerPromise) {
              let _registerPromise = this.service.onUserInfo(this.authData, this.userInfo);
              if (_registerPromise instanceof Promise) {
                this._registerPromise = _registerPromise.then(res => {
                  this.user = res;
                  Sunrise.logger.debug('完成用户注册和绑定，weapp.user 生效！！ ')
                });
              }
            }
          }
        }
        return this._registerPromise ? this._registerPromise : Promise.resolve();
      }


      /**
       * 异常的逻辑处理
       */
      doClear() {
        Sunrise.store.remove(SR_LOGIN_TOKEN);
      }

      /**
       * 授权拦截
       */
      doAuthorize(isCheckSession) {
        let wechatOptions = Sunrise.config.wechatOptions || {};
        if (wechatOptions.hasWechatLogin) {

          let hasKey = Sunrise.store.has(SR_LOGIN_TOKEN)
          let token = Sunrise.store.get(SR_LOGIN_TOKEN);
          if (hasKey) {
            if (_checkSessionTime && !isCheckSession) {
              let _nowTime = new Date().getTime();
              if (_nowTime < _checkSessionTime) {
                return this.refreshAccessToken(token).catch(() => {
                  return Promise.resolve();
                });
              }
            }
            _checkSessionTime = dateUtil.getUpTime(wechatOptions.sessionExpiresTime || '3h').getTime();
            Sunrise.logger.debug('检查 wx.checkSession ')
            return this.checkSession().then(() => {
              Sunrise.logger.debug('微信 Session Success！token：', token)
              return this.refreshAccessToken(token).catch(() => {
                return Promise.resolve();
              });
            }).catch(error => {
              Sunrise.logger.error('wx.checkSession 异常处理', error )
              this.doClear();
              return this.doAuthorize();
            })
          }
          else {
            return this.doLogin();
          }
        }
        else {
          return Promise.resolve();
        }
      }

      /**
       * 获得图片信息
       */
      getImageInfo(src) {
        return new Promise((resolve, reject) => {
          wx.getImageInfo({
            src:src,
            success: res => {
              resolve(res);
            },
            fail: error => {
              reject(error);
            }
          })
        });
      }

      /**
       * 下载文件
       */
      downloadFile(url,header) {
        return new Promise((resolve, reject) => {
          wx.downloadFile({
            url: url,
            header: header || {},
            success: res => {
              resolve(res);
            },
            fail: error => {
              reject(error);
            }
          })
        });
      }
      

      /**
       * 点击保存到相册
       */
      canvasToTempFilePath(canvasId,pageCtx) {
        return new Promise((resolve, reject) => {
          wx.canvasToTempFilePath({
            canvasId: canvasId,
            success: res => {
              resolve(res);
            },
            fail: error => {
              reject(error);
            }
          }, pageCtx)
        });        
      }

      /**
       * 点击保存到相册
       */
      saveImageToPhotosAlbum(filePath) {
        return new Promise((resolve, reject) => {
          wx.saveImageToPhotosAlbum({
            filePath: filePath,
            success: res => {
              resolve(res);
            },
            fail: error => {
              reject(error);
            }
          })
        });
      }

      /**
       * Canvas 保存到相册
       */
      saveCanvas(canvasId, _this) {
        return this.canvasToTempFilePath(canvasId, _this).then(file => {
          return this.saveImageToPhotosAlbum(file.tempFilePath);
        })
      }


    }

    return new Weapp();
}