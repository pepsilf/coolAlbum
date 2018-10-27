const TOKEN_EXPIRE = 259200000 // token有效期默认3天
const TOKEN_REFRESH_BEFORE = 21600000 // 提前6小时刷新token
const MP_LOGIN_DATA = 'mp-login-data' // 缓存key

const http = function(sunrise) {

  // 发送get请求
  function get(options) {
    options.method = 'GET'
    send(options)
  }

  // 发送post请求
  function post(options) {
    options.method = 'POST'
    send(options)
  }

  let ignores = []
  let locks = []
  let lockActions = []

  // 发送http请求，默认post
  function send(options) {
    if (options.ignore) { // 如果传了ignore属性，即该接口不能并行执行，并行的请求会忽略掉
      if (ignores.indexOf(options.ignore) !== -1) {
        return
      } else {
        ignores.push(options.ignore)
      }
    }
    if (options.lock) { // 如果传了lock属性，并行执行的请求会等待第一个请求返回结果，后面的请求会共享第一个请求的结果
      if (locks.indexOf(options.lock) !== -1) {
        lockActions.push({
          lock: options.lock,
          options: options
        })
        return
      } else {
        locks.push(options.lock)
      }
    }
    let doRequest = function() {
      let contentType = 'application/x-www-form-urlencoded'
      if (options.contentType && options.contentType === 'json') {
        contentType = 'application/json'
      }
      let url = options.url
      if (url.substr(0, 4) !== 'http') {
        url = sunrise.config.baseApi + (options.basePath || sunrise.config.basePath) + url
      }
      if (options.loading) { // 是否显示loading框
        wx.showLoading({})
      }
      let header = {
        'content-type': contentType,
        'osType': 'xapp',
        'hn-app-id': sunrise.config.serviceName || ''
      }
      if (sunrise.wechat && sunrise.wechat.accessToken) {
        header['access-token'] = sunrise.wechat.accessToken
      }
      if (options.header) {
        header = Object.assign(header, options.header)
      }
      if (options.loginData) { // 参数里是否带有登录后返回的属性
        options.data[options.loginData] = sunrise.wechat[options.data[options.loginData]]
      }
      wx.request({
        url: url,
        method: options.method || 'POST',
        data: options.data,
        header: header,
        complete: function(res) {
          if (options.ignore) {
            ignores.splice(ignores.indexOf(options.ignore), 1)
          }
          let log = function(level, result) {
            if (sunrise.config.env === 'dev') { // 非开发环境输出请求记录
              return
            }
            let req = { // 请求参数
              header: header,
              method: options.method || 'POST',
              url: url,
              data: options.data
            }
            console[level](options.url, req, result)
          }
          let cbLockActions = function(success) { // 回调被锁住的请求
            if (options.lock) {
              locks = locks.filter(val => {
                return val != options.lock
              })
              if (lockActions.length) {
                lockActions = lockActions.filter(val => {
                  if (val.lock == options.lock) {
                    if (success) {
                      val.options.success && val.options.success(res.data.data)
                    } else {
                      val.options.fail ? val.options.fail(res.data || {
                        message: res.errMsg
                      }) : wx.showToast({
                        title: msg || '网络请求失败！',
                        icon: 'none'
                      })
                    }
                    return false
                  } else {
                    return true
                  }
                })
              }
            }
          }
          let onFail = function(msg) {
            if (options.fail) {
              if (options.loading) {
                wx.hideLoading()
              }
              options.fail(res.data || {
                message: msg
              })
            } else {
              wx.showToast({
                title: msg || '网络请求失败！',
                icon: 'none'
              })
            }
            cbLockActions(false)
          }
          if (res.statusCode === 200) {
            if (res.data.code === 0 || res.data.errorCode === 0) {
              options.success && options.success(res.data.data)
              if (options.loading) {
                wx.hideLoading()
              }
              cbLockActions(true)
              log('log', res.data)
            } else {
              onFail(res.data.message || res.data.msg)
              log('error', res.data)
            }
          } else {
            onFail(res.errMsg)
            log('error', res)
          }
          options.complete && options.complete()
        }
      })
    }
    if (options.noLogin) { // 如果请求不需要登录态，直接发送
      doRequest()
    } else {
      login({
        success: function() {
          doRequest()
        }
      })
    }
  }

  const login = function(options) {
    let getCache = function() { // 从缓存中读取登录数据
      let cache = wx.getStorageSync(MP_LOGIN_DATA)
      if (cache) {
        sunrise.wechat = JSON.parse(cache)
      }
    }
    let setCache = function() { // 保存登录数据到缓存中
      wx.setStorage({
        key: MP_LOGIN_DATA,
        data: JSON.stringify(sunrise.wechat)
      })
    }
    let onWechatLoginSuccess = function(data) { // 微信登录/刷新token成功回调
      sunrise.wechat.loggedIn = true
      sunrise.wechat.accessToken = data
      sunrise.wechat.tokenTime = new Date().getTime() // 记录当前获取token的时间
      options.success && options.success()
      setCache()
    }
    let refreshToken = function() { // 刷新token的方法
      post({
        lock: 'refresh-token',
        noLogin: true,
        url: sunrise.config.baseApi + '/mini-program-api/user/refresh/token',
        success: function(data) {
          onWechatLoginSuccess(data)
        },
        fail: function(res) {
          doLogin(true)
        }
      })
    }
    let doLogin = function() {
      let onFail = function(msg) {
        wx.showToast({
          title: msg || '登录失败！',
          icon: 'none'
        })
        options.fail && options.fail(msg)
      }
      wx.login({
        success: function(res) {
          if (res.code) {
            post({
              lock: 'wechat-login',
              noLogin: true,
              url: sunrise.config.baseApi + '/mini-program-api/user/login',
              data: {
                code: res.code
              },
              success: function(data) {
                onWechatLoginSuccess(data)
              },
              fail: function(res) {
                onFail(res.errMsg || res.message || res.msg)
              }
            })
          } else {
            onFail()
          }
        },
        fail: function(res) {
          onFail(res.errMsg)
        }
      })
    }
    let checkSession = function() { // 检查session
      wx.checkSession({
        success: function() {
          let expireTokenTime = new Date().getTime() - sunrise.wechat.tokenTime
          if (expireTokenTime >= TOKEN_EXPIRE) {
            console.warn('token已过期，重新登录')
            sunrise.wechat.loggedIn = false
            doLogin()
          } else if (expireTokenTime >= TOKEN_EXPIRE - TOKEN_REFRESH_BEFORE) {
            console.warn('token即将过期，重新获取')
            sunrise.wechat.loggedIn = false
            refreshToken()
          } else {
            options.success && options.success()
          }
        },
        fail: function() {
          console.warn('session过期，重新登录')
          sunrise.wechat.loggedIn = false
          doLogin()
        }
      })
    }
    if (!sunrise.wechat) {
      sunrise.wechat = {}
    }
    if (sunrise.wechat.loggedIn) { // 如果已登录，检查session
      checkSession()
    } else {
      getCache()
      if (sunrise.wechat.loggedIn) {
        checkSession()
      } else {
        doLogin()
      }
    }
  }

  return {
    send: send,
    get: get,
    post: post,
    login: login
  }
}
export default http