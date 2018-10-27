const Sunrise = getApp().sunrise;

Sunrise.Page({

  services: [],
  
  init(options) {
    this.setData({
      openid: options.openid
    })
  },
});