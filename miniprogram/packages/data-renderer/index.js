
const TouchButton = require('../utils/behavior/touch-button.js')

const Sunrise = getApp().sunrise;

Sunrise.Component({

  externalClasses: ['render-class', 'option-class'],

  mixins: [TouchButton],

  /**
 * 组件的属性列表
 */
  relations: {
    '../data-group/index': {
      type: 'parent'
    },

    '../index-section/index': {
      type: 'parent'
    }
  },

  /**
   * 组件的属性列表
   */
  properties: {

    
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

  }
})
