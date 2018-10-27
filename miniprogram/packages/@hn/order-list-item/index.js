const Sunrise = getApp().sunrise

const defaultOptions = {
  data: {}, // 事件回调会带上的数据
  shop: {
    imageUrl: '', // 店铺的头像
    name: '', // 店铺名
  },
  product: { // 商品信息
    imageUrl: '', // 商品图片url
    name: '', // 商品名
    spec: '', // 规格
    price: 0, // 价格
    count: 0, // 数量
  },
  order: {
    statusText: '', // 订单的状态
    buttons: [] // 按钮
  }
}

Sunrise.Component({
  properties: {
    options: {
      type: Object,
      value: defaultOptions,
      observer: function(val) {
        this._onOptionChange(val)
      }
    },
    primaryColor: { // 主色调，控制订单状态和primary类型的按钮
      type: String,
      value: '#F52A2A'
    },
    borderBottom: { // 底部的border
      type: String,
      value: '20rpx solid #f5f5f5;'
    }
  },

  methods: {
    _onOptionChange: function(options) { // 监听options改变
      options = Sunrise._.applyIf(options || {}, defaultOptions)
      options.product.price = Number(options.product.price).toFixed(2)
      this.setData({
        options
      })
    },

    onClick: function(e) { // 点击整个item
      this.triggerEvent('onClick', this.properties.options.data)
    },

    onShopClick: function(e) { // 点击商店
      this.triggerEvent('onShopClick', this.properties.options.data)
    },

    onProductClick: function(e) { // 点击商品
      this.triggerEvent('onProductClick', this.properties.options.data)
    },

    onButtonClick: function(e) { // 点击按钮，把按钮设置的action返回
      this.triggerEvent('onButtonClick', {
        action: e.currentTarget.dataset.action,
        ...this.properties.options.data
      })
    }
  }
})