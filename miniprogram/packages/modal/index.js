// packages/modal/modal.js


const Sunrise = getApp().sunrise;
const Dialog = require('../utils/behavior/dialog.js');

Sunrise.Component({

  mixins: [Dialog],

  /**
   * 组件的属性列表
   */
  properties: {



    isClose: {
      type: Boolean,
      value: true
    },
    // openType: {
    //   type: String,
    //   value: ''
    // },

    // title: String,

    // confirmButtonText: {
    //   type: String,
    //   value: '确定'
    // },

    // cTitle: {
    //   type: String,
    // },

  },

  /**
   * 组件的初始数据
   */
  data: {
 
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handlerHide(e) {
      this.hide();
    }
  }
})
