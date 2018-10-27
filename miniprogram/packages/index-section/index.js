// packages/index-section/index.js
Component({
  /**
   * 组件的属性列表
   */
  relations: {
    '../index-list/index': {
      type: 'parent'
    },

    '../data-renderer/index': {
      type: 'child'
    }
  },

  properties: {
    char:String
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
