const Sunrise = getApp().sunrise

Sunrise.Component({

  properties: {
    show: Boolean, // 显示or隐藏
    maxLevel: { // 最多层级 0：省 1：市 2：区
      type: Number,
      value: 2
    },
    ds: { // 数据源，hn为大网，yx为优选，默认是大网的地区数据
      type: String,
      value: 'hn'
    },
    shortName: Boolean, // 是否显示短名
  },

  services: ['$@hn.AreaService'],

  data: {
    labels: ['请选择'],
    items: [],
    level: 0,
  },

  methods: {
    init: function() {
      this.getItems()
      this.result = { // 结果集
        provinceId: 0,
        provinceName: '',
        cityId: 0,
        cityName: '',
        areaId: 0,
        areaName: ''
      }
    },

    getItems: function() { // 获取省市区列表
      let id = 0
      switch (this.data.level) {
        case 1:
          id = this.result.provinceId
          break;
        case 2:
          id = this.result.cityId
          break;
      }
      let method = this.properties.ds == 'hn' ? 'find' : 'findYx'
      this.service.hn.$area[method](id).then(data => {
        this.setData({
          items: data
        })
      })
    },

    onLabelSelect: function(e) { // 点击标签
      let index = e.currentTarget.dataset.index
      let labels = this.data.labels
      switch (index) {
        case 0:
          labels = ['请选择']
          this.setData({
            level: 0,
            labels: labels
          })
          this.getItems()
          break;
        case 1:
          labels = [this.result.provinceName, '请选择']
          this.setData({
            level: 1,
            labels: labels
          })
          this.getItems()
          break;
      }
    },

    onItemSelect: function(e) { // 点击选择省市区
      let id = e.currentTarget.dataset.id
      let name = e.currentTarget.dataset.name
      let labels = this.data.labels
      labels.splice(this.data.level, 1, name)
      if (labels.length <= this.properties.maxLevel) {
        labels.push('请选择')
      }
      switch (this.data.level) {
        case 0:
          this.result.provinceId = id
          this.result.provinceName = name
          break;
        case 1:
          this.result.cityId = id
          this.result.cityName = name
          break;
        case 2:
          this.result.areaId = id
          this.result.areaName = name
          break;
      }
      let nexLevel = this.data.level + 1
      if (nexLevel <= this.properties.maxLevel) {
        this.setData({
          level: nexLevel,
          labels: labels
        })
        this.getItems()
      } else {
        this.triggerEvent('change', this.result)
        this.setData({
          labels: labels
        })
        this.hide()
      }
    },

    hide: function() {
      this.setData({
        show: false
      })
    },
  }
})