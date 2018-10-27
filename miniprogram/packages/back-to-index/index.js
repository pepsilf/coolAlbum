const Sunrise = getApp().sunrise

const defaultPosition = [{ // 不同主题的默认位置不一样
  bottom: 64,
  right: 0
}, {
  bottom: 67,
  right: 23
}]

Component({

  externalClasses: ['ex-class'],

  properties: {
    bottom: { //与底部的距离
      type: Number,
      value: 0
    },
    right: Number, // 与右边的距离
    index: { // 首页路径
      type: String,
      value: '/pages/index/index'
    },
    theme: { // 样式切换
      type: Number,
      value: 1
    },
    show: { // 是否显示
      type: Boolean,
      value: false
    }
  },

  data: {
    noPrePage: false
  },

  ready: function() {
    // 页面栈是否只有一个，如果是的话，那除非是首页，不然就是分享出来的
    if (!Sunrise.util.getPrePage()) {
      this.setData({
        noPrePage: true
      })
    }
    this.setData({
      dBottom: defaultPosition[this.properties.theme].bottom,
      dRight: defaultPosition[this.properties.theme].right
    })
  },

  methods: {
    gotoIndex: function() {
      wx.reLaunch({
        url: this.properties.index,
      })
    }
  }
})