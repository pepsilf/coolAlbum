const _ = require('../../utils/attr.js')
const defaultOptions = {
  price: 0,
  mainImg: '',
  stock: 0,
  specList: [],
  noDefaultSelected: false, // 是否没有默认选中项，没有的话价格会显示
}

Component({
  properties: {
    show: Boolean, // 是否显示
    options: {
      type: Object,
      value: defaultOptions,
      observer: function(val) {
        this._onOptionChange(val)
      }
    },
    selectedSpecIndex: { // 默认选中的规格，-1表示无规格可选
      type: Number,
      value: 0
    },
    count: { // 数量
      type: Number,
      value: 1
    }
  },

  data: {},

  methods: {
    doHide: function() { // 点击隐藏
      this.setData({
        show: false
      })
    },

    _onOptionChange: function(options) { // option改变的时候要设置默认选中项
      options = _.applyIf(options || {}, defaultOptions)
      if (options.noDefaultSelected && options.specList.length) { // 如果默认不选中，价格显示价格区间
        let minPrice = 0
        let maxPrice = 0
        options.stock = 0
        options.specList.forEach(val => {
          if (val.disabled || !val.stock) {
            return;
          }
          options.stock += val.stock
          let price = val.price
          if (!minPrice) {
            minPrice = price
          }
          if (!maxPrice) {
            maxPrice = price
          }
          if (price < minPrice) {
            minPrice = price
          }
          if (price > maxPrice) {
            maxPrice = price
          }
        })
        if (minPrice == maxPrice) {
          options.price = minPrice.toFixed(2)
        } else {
          options.price = minPrice.toFixed(2) + '~￥' + maxPrice.toFixed(2)
        }
        this.setData({
          options: options,
          count: 1,
          selectedSpecIndex: -1
        })
      } else {
        options.price = Number(options.price).toFixed(2)
        let index = null
        if (options.specList && options.specList.length) {
          options.specList.forEach((val, i) => {
            val.price = val.price.toFixed(2)
            if (val.stock && !val.disabled && index === null) {
              index = i
            }
          })
        }
        this.setData({
          options: options,
          count: 1,
          selectedSpecIndex: index === null ? -1 : index
        })
      }
    },

    onSpecChange: function(e) { // 点击切换规格
      let index = e.currentTarget.dataset.index
      let disabled = e.currentTarget.dataset.disabled
      if (disabled || this.properties.selectedSpecIndex == index) {
        return
      } else {
        this.setData({
          selectedSpecIndex: index
        })
        this.updateCount(1) // 切换规格自动把数量重置为1
      }
    },

    doConfirm: function() {
      if (this.properties.selectedSpecIndex == -1) {
        if (this.properties.options.specList.length) {
          wx.showToast({
            title: '请先选择规格',
            icon: 'none'
          })
          return
        }
        let stock = this.properties.options.stock
        if (stock == 0) {
          wx.showToast({
            title: '没有可购买的商品',
            icon: 'none'
          })
        } else {
          this.doHide()
          this.triggerEvent('onConfirm', {
            count: this.properties.count
          })
        }
      } else {
        this.doHide()
        this.triggerEvent('onConfirm', {
          count: this.properties.count,
          spec: this.properties.options.specList[this.properties.selectedSpecIndex],
          specIndex: this.properties.selectedSpecIndex
        })
      }
    },

    updateCount: function(newVal) { // 更新数量
      let stock = 0
      if (this.properties.selectedSpecIndex == -1) {
        if (this.properties.options.specList.length) {
          wx.showToast({
            title: '请先选择规格',
            icon: 'none'
          })
          return
        }
        stock = this.properties.options.stock
      } else {
        stock = this.properties.options.specList[this.properties.selectedSpecIndex].stock
      }
      if (stock == 0) {
        return
      }
      newVal = Number(newVal)
      if (newVal <= 0) {
        newVal = 1
      } else if (stock != -1 && newVal > stock) {
        newVal = Number(stock)
      }
      this.setData({
        count: newVal
      })
    },

    onCountChange: function(e) {
      this.updateCount(e.detail.value)
    },

    doAdd: function() {
      this.updateCount(this.properties.count + 1)
    },

    doSubtract: function() {
      this.updateCount(this.properties.count - 1)
    },
  }
})