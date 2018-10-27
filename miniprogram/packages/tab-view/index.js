Component({

  externalClasses: ['border-custom'],
  options: {
    multipleSlots: true
  },

  properties: {
    tabs: Array, // tab列表
    activeIndex: Number, // 可以指定默认选中的tab
    color: { // 字体颜色
      type: String,
      value: '#333'
    },
    activeColor: String, // 选中的颜色
    fontSize: { // 字体大小
      type: String,
      value: '30rpx'
    },
    activeFontSize: { // 选中时的字体大小
      type: String,
      value: '34rpx'
    },
    height: { // tab高度
      type: String,
      value: '80rpx'
    },
    barWidth: { // 底部的bar的宽度
      type: String,
      value: '60rpx'
    },
    barColor: { // 底部的bar的颜色
      type: String,
      value: '#333'
    },
    padding: { // padding样式
      type: String,
      value: '0'
    }
  },

  methods: {
    onTabClick(e) {
      let index = e.currentTarget.dataset.index
      this.setData({
        activeIndex: index
      })
      this.triggerEvent('onTabClick', index)
    },
    changeTab(index) {
      this.setData({
        activeIndex: index
      })
    }
  }
})