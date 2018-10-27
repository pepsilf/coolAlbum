const Sunrise = getApp().sunrise;
const pageParamTypes = [ // 分页参数类型，由于后端分页参数不一致，这里需要配置一下
  {
    pageNumParam: 'pageNumber',
    pageSizeParam: 'pageSize',
    totalField: 'size',
    dataField: 'datas',
    normal: true // 是否是平常的分页参数
  },
  {
    pageNumParam: 'after',
    pageSizeParam: '',
    totalField: '',
    dataField: ''
  },
  {
    pageNumParam: 'timestamp',
    pageSizeParam: '',
    totalField: 'total',
    dataField: 'datas'
  },
  {
    pageNumParam: 'pageNumber',
    pageSizeParam: 'pageSize',
    totalField: 'rowCount',
    dataField: 'datas',
    normal: true
  },
  {
    pageNumParam: 'pageNumber',
    pageSizeParam: 'pageSize',
    totalField: 'totalElements',
    dataField: 'content',
    normal: true
  },
  {
    pageNumParam: 'page',
    pageSizeParam: 'size',
    totalField: 'total',
    dataField: 'data',
    normal: true
  },
  {
    pageNumParam: 'pageNum',
    pageSizeParam: 'pageSize',
    totalField: 'total',
    dataField: 'list',
    normal: true
  },
  {
    pageNumParam: 'pageNum',
    pageSizeParam: 'pageSize',
    totalField: 'rowCount',
    dataField: 'datas',
    normal: true
  },
];

/**
 *  列表加载组件
 */
Sunrise.Component({

  externalClasses: ['ex-class'],

  options: {
    multipleSlots: true
  },

  properties: {
    options: { // option设置
      type: Object,
      value: null,
      observer: function (val) {
        this._onOptionsChanged(val)
      }
    },
    load: { // 是否加载
      type: Boolean,
      value: true
    },
    dataField: String,
    showAllLoaded: { // 是否显示加载完的样式
      type: Boolean,
      value: true
    }
  },

  data: {
    allLoaded: false,
    hasData: false,
    hasError: false
  },

  methods: {

    _onOptionsChanged: function (p) { // 属性修改触发
      if (!p) {
        return
      }

      let currentPage = Sunrise.util.getCurrentPage()
      currentPage.onReachBottom = () => {
        currentPage._onReachBottom && currentPage._onReachBottom()
        if (this.properties.load) {
          this.listLoader && this.listLoader.load()
        }
      }
      this.page = currentPage

      this.p = p
      this.listLoader = this.newListLoader({
        service: p.service,
        func: p.func,
        pageParamType: p.pageParamType,
        pageSize: p.pageSize,
        data: p.data,
        pageNum: p.pageNum,
        success: this.onSuccess,
        fail: this.onError
      })
      if (this.properties.load) {
        this.listLoader.load()
      }
    },

    onSuccess: function (data) {
      this.ctx.triggerEvent('success', data)
      if (this.ctx.p.field) {
        if (this.ctx.p.pageParamType && pageParamTypes[this.ctx.p.pageParamType].dataField) {
          data = data[pageParamTypes[this.ctx.p.pageParamType].dataField]
        }
        if (this.ctx.p.mapper) {
          data = data.map(this.ctx.page[this.ctx.p.mapper])
        }
        let prevData = this.ctx.page.data[this.ctx.p.field]
        if (!prevData || !prevData.length) {
          prevData = []
        }
        data = prevData.concat(data)
        let setData = {}
        setData[this.ctx.p.field] = data
        this.ctx.page.setData(setData)
      }
    },

    onError: function (err) {
      this.ctx.triggerEvent('error', err)
    },

    newListLoader: function (param) {
      let _this = this
      let listLoader = {
        ctx: _this,

        _init: function (param) {
          Object.assign(this, {
            param: param,
            service: Sunrise.context.getBean(param.service), // 调用的服务
            func: param.func,
            pageParam: isNaN(Number(param.pageParamType)) ? null : pageParamTypes[param.pageParamType],
            data: param.data || {}, // 请求参数
            pageSize: param.pageSize || 5, // 默认列表长度
            pageNum: param.pageNum || 0, // load方法会+1，所以默认从0开始
            success: param.success, // 成功回调
            fail: param.fail, // 失败回调
            sequence: 0, // 一些分页参数需要这个值
            timestamp: '', // 另一种分页参数
            dataCount: 0 // 记录数据量
          })
          this.ctx.setData({
            allLoaded: false,
            hasData: false,
            hasError: false
          })
        },

        load: function () { // 加载下一页
          if (this.ctx.data.allLoaded) {
            return
          }
          if (this.pageParam) {
            if (this.pageParam.normal) {
              this.pageNum++
            } else if (this.param.pageParamType === 1) {
              this.pageNum = this.sequence
            } else if (this.param.pageParamType === 2) {
              this.pageNum = this.timestamp
            }
          }
          this._sendRequest();
        },

        reset: function (param) { // 重置请求参数
          this.init(param)
        },

        _sendRequest: function () { // 发送请求
          if (!this.reqData) {
            let applyData = {}
            if (this.pageParam) {
              this.pageParam.pageNumParam && (applyData[this.pageParam.pageNumParam] = this.pageNum)
              this.pageParam.pageSizeParam && (applyData[this.pageParam.pageSizeParam] = this.pageSize)
            }
            this.reqData = Sunrise._.applyIf(this.data, applyData)
          } else {
            this.reqData[this.pageParam.pageNumParam] = this.pageNum
          }
          this.service[this.func](this.reqData).then(data => {
            if (this.pageParam) {
              if (this.pageParam.normal) {
                if (this.pageParam.totalField) {
                  if (this.pageNum * this.pageSize >= data[this.pageParam.totalField]) {
                    this.ctx.setData({
                      allLoaded: true
                    })
                  }
                }
                if (this.pageParam.dataField) {
                  this.ctx.setData({
                    hasData: !!(data && data[this.pageParam.dataField] && data[this.pageParam.dataField].length)
                  })
                } else if (this.pageParam.dataField === '') {
                  this.ctx.setData({
                    hasData: !!(data && data.length)
                  })
                } else {
                  this.ctx.setData({
                    hasData: true
                  })
                }
              } else if (this.param.pageParamType === 1) {
                if (data && data.length < 10) {
                  this.ctx.setData({
                    allLoaded: true
                  })
                }
                this.ctx.setData({
                  hasData: data && data.length
                })
                if (data && data.length) {
                  this.sequence = data[data.length - 1].sequence
                }
              } else if (this.param.pageParamType === 2) {
                this.dataCount += (data && data[this.pageParam.dataField]) ? data[this.pageParam.dataField].length : 0
                if ((!data || !data[this.pageParam.dataField]) || data[this.pageParam.dataField].length < 10) {
                  this.ctx.setData({
                    allLoaded: true
                  })
                }
                this.ctx.setData({
                  hasData: !!this.dataCount
                })
                if (data && data[this.pageParam.dataField] && data[this.pageParam.dataField].length) {
                  this.timestamp = data.timestamp || ''
                }
              }
            } else {
              let newData = {
                allLoaded: true
              }
              if (this.ctx.properties.dataField) {
                newData.hasData = !!(data && data[this.ctx.properties.dataField] && data[this.ctx.properties.dataField].length)
              } else {
                newData.hasData = true
              }
              this.ctx.setData(newData)
            }
            this.success && this.success(data)
          }).catch(err => {
            this.pageNum -= 1
            this.ctx.setData({
              hasError: true,
              allLoaded: true,
              hasData: false
            })
            if (this.fail) {
              this.fail(err)
            } else {
              wx.showToast({
                title: err.message || err.msg || '网络连接失败',
                icon: 'none'
              })
            }
            console.error(err)
          })
        }
      };
      listLoader._init(param)
      return listLoader
    }

  }
});