// packages/data-group/index.js

const Bound = require('../utils/bound.js')

const Sunrise = getApp().sunrise;


Sunrise.Component({


  externalClasses: ['content-class'],

  options: {
    multipleSlots: true
  },

  relations: {
    '../data-renderer/index': {
      type: 'child'
      // linked: function linked() {
      //   //this._updateRenderer();
      // },
      // linkChanged: function linkChanged() {
      //   //this._updateToScrollMap();
      // },
      // unlinked: function unlinked() {
      //   //this._updateRenderer();
      // }
    }
  },

  /**
   * 组件的属性列表
   */
  properties: {
    serverName:String,
    serverMethod:String,
    dsField:String,


    /**
     * 分页数据集合
     */
    contentField:{
      type:String,
      value:'list'
    },

    /**
     * 是否最后一页的标示
     * 没有该属性，比较当前页和总页码是否相等。
     * 总页码没有的话，不分页
     * 
     */
    lastPageField: {
      type: String,
      value: 'isLastPage'
    },

    /**
     * 总页码
     */
    pagesField: {
      type: String,
      value: 'pages'
    },


    emptyTip: {
      type: String,
      value: ''
    },

    params:{
      type:Object,
      value:{},
      observer: function (newVal, oldVal) {
        this._optionsParamsChange(newVal, oldVal);
      }
    },

    

    pageSize: {
      type:Number,
      value:20
    },

    currentHeight: {
      type: Number,
      value: 0
    },

    isScroll: {
      type:Boolean,
      value:true
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    //currentHeight: null,
    pageCtx: Object,

    showLoadMore:true,
    cellUpdateTimeout:0,
    pageNum:1,
    isLastPage: false,
    isCompleted: true,
    isStop: false,
    isEmpty: false
  },

  detached() {
    this.setData({ isStop: true })
  },

  attached() {
    this.setData({ isStop: false})
  },

  /**
   * 组件的方法列表
   */
  methods: {
    init() {

      let _this = this;

      if (!this.data.isScroll) {
        let pageCtx = Sunrise.util.getCurrentPage();
        pageCtx.onReachBottom = function() {
          //debugger
          _this.doPage();
        }
      }
      else {
          if (this.data.currentHeight) {
              this.setData({
                  currentHeight: this.data.currentHeight
              })
          }
          else {
              Bound.getBound('.datagroup-container', r => {
                  let currentHeight = Sunrise.sys.windowHeight - r.top;
                  this.setData({
                      currentHeight: currentHeight
                  })
              }, this);
          }
      }

      if (!Sunrise._.isEmpty(this.data.params)) {
          this.refreshData(this.data.pageNum);
      }
    },

    setCtx(pageCtx) {
      this.setData({ pageCtx });
    },

    _optionsParamsChange(newVal,oldVal) {
      this.hasComplete && this.refresh();
    },

    refresh() {
      //params && this.set
      this.data.pageNum = 1;
      this.refreshData(this.data.pageNum);
    },

    refreshData(pageNum) {
      var params = Sunrise._.apply({ pageNum, pageSize: this.data.pageSize },this.data.params);
      var server = Sunrise.context.getBean(this.data.serverName);
      if (server && typeof (server[this.data.serverMethod]) == 'function') {
        var method = server[this.data.serverMethod];
        method.call(server, params).then(res => {
          this.concatList(res);
        })
        this.setData({ isCompleted: false })
      }
    },

    concatList(res) {

      var ds = res[this.data.contentField] || [];
      var pageCtx = this.data.pageCtx || Sunrise.util.getCurrentPage();
      var dsField = this.data.dsField;
      let pageNum = this.data.pageNum;
      var data = pageNum == 1 ? [] : pageCtx.data[dsField];

      data = data.concat(ds);
      let newData = {};
      newData[dsField] = data;
      pageCtx.setData(newData);  

      let isLastPage = true;
      if (res.hasOwnProperty(this.data.lastPageField)) {
        isLastPage = res[this.data.lastPageField];
      }
      else {
        if (res.hasOwnProperty(this.data.pagesField)) {
          let pages = res[this.data.pagesField];
          isLastPage = pages ? pages == pageNum : true;
        }
      }


      let isEmpty = isLastPage && pageNum == 1 ? !data.length : false;

      //debugger
      this.setData({
        isCompleted: true,
        isEmpty,
        isLastPage
      })
    },


    doPage() {
      if (this.data.isLastPage || !this.data.isCompleted || this.data.isStop) {
        return;
      }
      //console.log('renderers', 'scrollToBottomHandler');
      this.refreshData(++this.data.pageNum);
    },


    scrollToBottomHandler() {
      this.doPage();
    }


  }
})
