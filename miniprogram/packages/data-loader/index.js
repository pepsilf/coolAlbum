const Sunrise = getApp().sunrise

Sunrise.Component({

  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },

  properties: {
    options: {
      type: Object,
      value: null,
      observer: function(val) {
        this._onOptionsChanged(val)
      }
    },
    showLoading: Boolean, // 显示loading
    showDefaultLoading: Boolean, // 显示默认的loading样式
    showError: Boolean, // 显示错误并重试
    showDefaultError: Boolean, // 显示默认的错误样式,
    showNoData: Boolean, // 显示没有数据
    showDefaultNoData: Boolean // 显示默认的没有数据的样式
  },

  data: {
    isLoading: true, // 正在加载
    isError: false, // 接口报错
    isNoData: false // 没有数据
  },

  methods: {
    _onOptionsChanged: function(p) {
      if (!p) {
        return
      }
      this.page = Sunrise.util.getCurrentPage()
      let _this = this
      this.dataLoader = {
        ctx: _this,
        _init: function() {
          Object.assign(this, {
            service: Sunrise.context.getBean(p.service),
            func: p.func,
            data: p.data,
            dataField: p.dataField,
            field: p.field,
            mapper: p.mapper,
            success: p.success,
            fail: p.fail
          })
        },
        load: function() {
          this.ctx.setData({
            isLoading: true
          })
          this.service[this.func](this.data || {}).then(res => {
            this.ctx.setData({
              isLoading: false
            })
            if (this.dataField) {
              res = res ? res[this.dataField] : null
            }
            if (res) { // 判断是否有数据
              if (this.field) {
                this.ctx.page.setData({
                  [this.field]: this.mapper ? this.ctx.page[this.mapper](res) : res
                })
              }
            } else {
              this.ctx.setData({
                isNoData: true
              })
            }
          }).catch(err => {
            this.ctx.setData({
              isLoading: false,
              isError: true
            })
          })
        }
      }
      this.dataLoader._init()
      this.dataLoader.load()
    },

  }
})