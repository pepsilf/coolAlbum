const Sunrise = getApp().sunrise

const telRegExp = /((13[0-9]|15[0-35-9]|18[0-9]|14[5-9]|166|17[0-9]|19[8-9])[0-9]{8})/

Sunrise.Component({
  properties: {
    logisticCode: String, // 物流单号
    logisticName: String, // 物流公司
    state: String, // 物流状态
    hideCopyBtn: Boolean, // 是否隐藏复制单号的按钮
    traces: { // 物流轨迹 {station:'', time:''}
      type: Array,
      value: [],
      observer: function(traces) {
        this._onDataChanged(traces)
      }
    }
  },

  data: {
    Traces: []
  },

  methods: {
    _onDataChanged: function(traces) {
      this.setData({
        Traces: traces.map(val => {
          val.station = this._splitMobile(val.station)
          return val
        })
      })
    },

    _splitMobile(val) { // 提取字符串里的手机号
      let mobileTag = false // split匹配的问题，会多匹配手机号的前三位，所以要删掉
      let station = val.split(telRegExp).filter(str => {
        if (mobileTag) {
          mobileTag = false
          return false
        }
        mobileTag = telRegExp.test(str)
        return true
      }).map(str => {
        return {
          isMobile: telRegExp.test(str),
          val: str
        }
      })
      return station
    },

    doCall(e) { // 打电话
      let mobile = e.currentTarget.dataset.mobile
      wx.makePhoneCall({
        phoneNumber: mobile
      })
    },

    doCopy(e) { // 复制单号
      let content = e.currentTarget.dataset.content
      wx.setClipboardData({
        data: content
      })
      wx.showToast({
        title: '已保存到剪贴板'
      })
    }
  }
})