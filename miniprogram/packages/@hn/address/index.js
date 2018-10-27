const Sunrise = getApp().sunrise

Sunrise.Component({

  services: ['$@hn.YxAddressService'],

  events: {
    'addressChanged': 'onAddressChanged'
  },

  properties: {
    ds: { // 地址的数据源，hn: 大网 yx: 优选 wx: 微信地址(默认)
      type: String,
      value: 'wx'
    }
  },

  data: {
    address: null, // 当前选中的地址
  },

  methods: {
    init: function() {
      if (this.properties.ds == 'yx') {
        this.service.hn.$yxAddress.queryDefaultAddress().then(res => {
          this.setData({
            address: res
          })
          this.triggerEvent('change', this.service.hn.$yxAddress.convertToAddress(res))
        })
      }
    },

    changeAddress: function() { // 点击地址修改
      if (this.properties.ds == 'wx') {
        Sunrise.weapp.doAuth('scope.address').then(() => {
          wx.chooseAddress({
            success: (res) => {
              this.setData({
                address: {
                  name: res.userName,
                  mobile: res.telNumber,
                  provinceName: res.provinceName,
                  cityName: res.cityName,
                  areaName: res.countyName,
                  detailInfo: res.detailInfo
                }
              })
              this.triggerEvent('change', res)
            }
          })
        })
      } else {
        wx.navigateTo({
          url: `/pages/@hn/address-list/index?add=true&ds=${this.properties.ds}`
        })
      }
    },

    onAddressChanged: function(address) { // 在其他页面修改了收货地址
      this.setData({
        address: address
      })
      if (this.data.ds == 'yx') {
        this.triggerEvent('change', this.service.hn.$yxAddress.convertToAddress(address))
      }
    }
  }
})