// components/tabbar/index.js

const Bound = require('../../packages/utils/bound.js')
const Sunrise = getApp().sunrise;

Sunrise.Component({
  /**
   * 组件的属性列表
   */
  properties: {

    dataProvider:{
      type:Array,
      value: Sunrise.config.tabbar || []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    hasIPhoneX: Sunrise.sys.device == 'iPhoneX',
    paddingTop:0,
    paddingBottom:0,
    router: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
      init() {
        let route = '/' + Sunrise.util.getCurrentPage().route;
        let dataProvider = this.data.dataProvider;
        dataProvider.forEach(v => {
          v.selected = route.indexOf(v.url) != -1; 
        });
        Bound.getBound('.tabbar-container', r => {
          if (r) {
            this.setData({
              dataProvider,
              //paddingTop:40,
              paddingBottom: r.height
            });
          }
        },this);
      },

      tabChangeHandler(e) {
        let dataset = e.currentTarget.dataset;
        dataset.url && wx.redirectTo({
          url: dataset.url,
        });
      }
  }
})
