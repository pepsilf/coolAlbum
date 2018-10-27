// packages/header/index.js

const Sunrise = getApp().sunrise;

const BAR_HEIGHT = 40;

Sunrise.Component({
  /**
   * 组件的属性列表
   */
  properties: {

    title: {
      type: String,
      description: '标题'
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

    toolerHeight: BAR_HEIGHT,
    barHeight: Sunrise.sys.statusBarHeight + BAR_HEIGHT
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
