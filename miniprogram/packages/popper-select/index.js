// packages/popper-select/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: Boolean,
    title: String,
    scrollHeight: Number,
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
    hide(e) {
      this.setData({
        show: false
      });
      this.triggerEvent('hide', e);
    },
  }
})
