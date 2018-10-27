const Sunrise = getApp().sunrise

const defaultOptions = {
  edit: false, // 能不能编辑
  shop: {
    imageUrl: '', // 店铺的头像
    name: '', // 店铺名
    telNumber: '', // 店铺的电话，传了表示可以打电话
    arrow: false, // 是否显示右边的箭头,
  },
  product: { // 商品信息
    hidePrice: false, // 是否需要隐藏价格
    imageUrl: '', // 商品图片url
    name: '', // 商品名
    spec: '', // 规格
    specId: '', // 规格id
    price: 0, // 价格
    stock: 0, // 库存
    count: 1, // 购买数量
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
    }
  },

  methods: {
    _onOptionChange: function(options) { // 监听options改变
      options = Sunrise._.applyIf(options || {}, defaultOptions)
      options.product.price = Number(options.product.price).toFixed(2)
      this.setData({
        options: options
      })
    },

    updateCount: function(newVal) { // 更新数量
      let stock = this.properties.options.product.stock
      if (stock == 0) {
        return
      }
      newVal = Number(newVal)
      if (newVal <= 0) {
        newVal = 1
      } else if (stock != -1 && newVal > stock) {
        newVal = Number(stock)
      }
      let options = this.properties.options
      options.product.count = newVal
      this.setData({
        options: options
      })
      this.triggerEvent('countChanged', newVal)
    },

    onCountChange: function(e) {
      this.updateCount(e.detail.value)
    },

    doAdd: function() {
      this.updateCount(this.properties.options.product.count + 1)
    },

    doSubtract: function() {
      this.updateCount(this.properties.options.product.count - 1)
    },

    onClick: function() { // 点击整个item
      this.triggerEvent('onClick')
    },

    onShopClick: function() { // 点击商店
      this.triggerEvent('onShopClick')
    },

    onProductClick: function() { // 点击商品
      this.triggerEvent('onProductClick')
    },

    onCallClick: function() { // 点击打电话
      wx.makePhoneCall({
        phoneNumber: this.properties.options.shop.telNumber
      })
    }
  }

})