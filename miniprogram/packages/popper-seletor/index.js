// packages/category/index.js

const Popup = require('../utils/behavior/popup.js')
const Bound = require('../utils/bound.js')

const app = getApp();

const Sunrise = getApp().sunrise;

Sunrise.Component({

  mixins: [Popup],

  /**
   * 组件的初始数据
   */
  data: {
    top: 0,
    height: 0,
    overlay: false,
    showCategory: false
  },

  /**
   * 组件的方法列表
   */
  methods: {

    _showPropertiesChange(newVal, oldVal) {

      let selector = this.data.selector;

      if (newVal && selector) {
        Bound.getBound(selector, r => {
          if (r) {
            let top = this.data.type === 'top' ? r.top + r.height : 0;
            let height = `calc(100vh - ${top}px)`;
            this.setData({
              top: top,
              height: height,
              showCategory: newVal
            })
          } else { // 拿不到selector高度的话直接全屏
            this.setData({
              height: '100vh',
              showCategory: newVal
            })
          }
        });
      } else { // 不传selector默认全屏
        this.setData({
          height: '100vh',
          showCategory: newVal
        })
      }
    }
  }
})