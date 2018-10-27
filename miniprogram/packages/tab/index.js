'use strict';

const Sunrise = getApp().sunrise;
const Bound = require('../utils/bound.js')

Sunrise.Component({
  externalClasses: 'class',

  properties: {
    scroll: {
      type: Boolean,
      value: false
    },
    fixed: {
      type: Boolean,
      value: false
    },
    height: {
      type: Number,
      value: 45
    },
    list: {
      type: Array,
      value: []
    },
    selectedId: {
      type: [String, Number],
      value: '',
      observer: function (newVal, oldVal) {
        this._optionsSelectIdChange(newVal, oldVal);
      }
    },
    selector: {
      type: String,
      value: '.sr_tab'
    },
  },

  data: {
    show: false,
    scrollLeft:0,
    top: 0,
    scrollMap: {},
  },


  methods: {

    _optionsSelectIdChange(newVal,oldVal) {
      if(this.data.show) {
        let seletor = `.zan_tab_${newVal}`;
        let scrollLeft = this.data.scrollMap[seletor];
        this.setData({
          scrollLeft
        });
      }
    },

    init() {
      if (this.data.scroll) {
        Bound.getBound('.zan-tab', r => {
          if (r) {
            let top = r.top + r.height;
            this.setData({
              top
            });
          }
        },this);
        this._initScrollMap();
      }
    },

    _initScrollMap() {
      const _scrollMap = {};
      const _initScrollMap = index => {
        if (index > 0) {
          index--;
          let seletor = `.zan_tab_${index}`;
          Bound.getBound(seletor, r => {
            //console.log('r',r,index)
            _scrollMap[seletor] = r.left;
            _initScrollMap(index);
          },this);
        }
        else {
          this.setData({ scrollMap: _scrollMap });
        }
      }
      _initScrollMap(this.data.list.length);
    },



    _handleZanTabChange: function _handleZanTabChange(e) {
      var selectedId = e.currentTarget.dataset.itemId;
      this.setData({
        selectedId: selectedId
      });
      this.data.scroll && this.setData({
        show: false,
      });
      this.triggerEvent('tabchange', selectedId);
    },

    handlerShowMore(e) {
      this.setData({
        show:!this.data.show
      })
    }
  }
});