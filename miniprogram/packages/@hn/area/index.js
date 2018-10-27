// packages/area/index.js
const Popup = require('../../utils/behavior/popup.js')
const array = require('../../utils/array.js')

const Sunrise = getApp().sunrise;

Sunrise.Component({

  name: 'Area',

  mixins: [Popup],

  services: ['$@hn.AreaService'],
  /**
   * 组件的属性列表
   */
  properties: {
      showLevel:{
        type:Number,
        value:2
      },

      // hasReset: {
      //   type: Boolean,
      //   value: false,
      //   observer: function (newVal, oldVal) {
      //     this._resetPropertiesChange(newVal, oldVal);
      //   }
      // }
  },

  // advice: {

  // },
  /**
   * 组件的初始数据
   */
  data: {
    config: [{
      type: 'province' //省
    },
    {
      type: 'city'  //市
    },
    {
      type: 'area'  //区
    },
    {
      type: 'town'  //乡镇
    }],
    dataProvider:null,
    selelctIndex:0
  },


  /**
   * 组件的方法列表
   */
  methods: {

    _showPropertiesChange(newVal) {

      if (newVal && !this.data.dataProvider) {
        this.initDataProvider();
        this.initAreas();
      }
    },

    init() {

    },

    initDataProvider() {
      let dataProvider = [],
          showLevel = this.data.showLevel

      this.data.config.forEach((v,i) => {
        i < showLevel && dataProvider.push(v);
      });

      this.setData({
        dataProvider
      });
    },

    initAreas() {
      this.requeseAreas(0);
    },

    tapChangeHandler(e) {
      let dataset = e.currentTarget.dataset;
      let index = dataset.colunmIndex;
      let dataProvider = this.data.dataProvider;
      let d = dataProvider[index];
      let item = dataset.item;
      index++;
      if (dataProvider && index < dataProvider.length) {
        if (d.selectIndex != dataset.selectIndex) {
            d.selectIndex = dataset.selectIndex;
            this.requeseAreas(index, item.id);
        }
      }
      else {
        d.selectIndex = dataset.selectIndex;
        this.setData({
          show: false,
          dataProvider
        });
        this.triggerEvent('change', item);  
      }
    },

    chooseAllHandler(e) {

      let dataset = e.currentTarget.dataset;
      let dataProvider = this.data.dataProvider;
      let colunmIndex = dataset.colunmIndex;
      let index = colunmIndex - 1;
      if (index >= 0) {
        let d = dataProvider[index];
        this.triggerEvent('change', d.list[d.selectIndex]);  
      }
      else {
        this.triggerEvent('change');  
      }
    },

    reset() {
      let dataProvider = this.data.dataProvider;
      dataProvider.forEach(v=>{
        v.selectIndex = 0;
      })
    },

    callbackAreas(index,res) {
      let dataProvider = this.data.dataProvider;
      if (dataProvider && index < dataProvider.length) {
        let data = dataProvider[index];
        data.index = index;
        data.list = res;
        data.selectIndex = 0;
        if (res && res.length) {
          let d = res[0];
          this.requeseAreas(++index, d.id);
          return true;
        }
      }
      else {
        this.setData({
          dataProvider
        });
        //console.log('dataProvider-end', dataProvider)
      }
      return false;
    },

    requeseAreas(index,code) {
      this.service.hn.$area.find(code).then(res => {
        this.callbackAreas(index, res);
      }).catch(error => {

      });
    }
  }
})
