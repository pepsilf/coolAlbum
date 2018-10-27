module.exports = function(Sunrise) {

  class WxOpen { // 上报到微信开放平台

    constructor() {}

    init(options) {}

    stat() {
      let key = arguments[0]
      let value = arguments[1] || {}
      Sunrise.logger.info('事件上报微信开放平台：', key, value)
      wx.reportAnalytics(key, value);
    }

    pageInit() {}
  }

  return new WxOpen();
}