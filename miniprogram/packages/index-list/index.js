// packages/index-list/index.js

const Bound = require('../utils/bound.js')
const Sunrise = getApp().sunrise;

let leterTop = 0;
let containerTop = 0;

Sunrise.Component({

  /**
   * 组件的属性列表
   */
  relations: {
    '../index-section/index': {
      type: 'child',
      linked: function linked() {
        this._updateToScrollMap();
      },
      linkChanged: function linkChanged() {
        this._updateToScrollMap();
      },
      unlinked: function unlinked() {
        this._updateToScrollMap();
      }
    }
  },

  properties: {
    ds: {
      type: Array,
      value: []
    },

    emptyTip:{
      type:String,
      value:'没有任何可显示数据'
    },

    groupField: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentHeight:null,
    scrollTop:0,
    touchTip:'',
    cellUpdateTimeout:0,
    scrollMap: {}
  },

  /**
   * 组件的方法列表
   */
  methods: {


    init(options) {
      var data = this.data;
      if(data.ds && data.ds.length) {
        let stageHeight = Sunrise.sys.windowHeight;
        Bound.getBound('.indexlist-nav-container', r => {
          leterTop = r.top;
        },this);
        Bound.getBound('.indexlist-container', r => {
          containerTop = r.top;
          let currentHeight = stageHeight - containerTop;
          this.setData({
            currentHeight: currentHeight
          })
        }, this);
      }
    },

    destroy() {
      console.log('Component index-list destroy');
    },


    _scrollTopIndex: -1,

    _updateToScrollMap() {

      var _this = this;

      // 用 setTimeout 减少计算次数
      if (this.data.cellUpdateTimeout > 0) {
        clearTimeout(this.data.cellUpdateTimeout);
      }

      const _scrollMap = {};
      const _initScrollMap = sections => {
        if (sections.length > 0) {
          let d = sections.pop();
          let nodeId = '#'+d.id;
          Bound.getBound(nodeId, r => {
            let scrollTop = r.top - containerTop;
            _scrollMap[d.id] = scrollTop; 
            _initScrollMap(sections);
          });
        }
        else {
          this.setData({ scrollMap: _scrollMap });
        }
      }

      var cellUpdateTimeout = setTimeout(function () {
        _this.setData({ cellUpdateTimeout: 0 });
        var sections = _this.getRelationNodes('../index-section/index');
        _initScrollMap(sections);
      });
      this.setData({ cellUpdateTimeout: cellUpdateTimeout });
    },

    touchEndHandler(e) {
      this.touchMoveHandler(e);
    },

    touchMoveHandler(e) { 

      let dataset = e.currentTarget.dataset;
      let c = e.changedTouches[0];
      let innerY = c.clientY - leterTop;

      let index = Math.floor(innerY / 20);
      let ds = this.data.ds;
      let len = ds.length;

      index = index >= len ? len - 1 : 
              index < 0 ? 0 : index;

      if (this._scrollTopIndex != index) {
        this._scrollTopIndex = index;
        let scrollMap = this.data.scrollMap;
        let char = ds[index].char;

        this.setData({
          scrollTop: scrollMap[char],
          touchTip: char
        })
      }
    },
  }
});


