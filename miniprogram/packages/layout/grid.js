// packages/layout/gird.js

const array = require('../utils/array.js')
const _ = require('../utils/attr.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list : {
      type: Array,
      observer: function (newVal, oldVal) {
        this._listPropertiesChange(newVal);
      }
    },


    groupField: String,
    groupLabelField: String,
    groupKeyField: String,

    type: String,

    labelField:{
      type: String,
      value: 'name'
    },

    keyField: {
      type: String,
      value: 'id'
    },

    cols:{
      type:Number,
      value:3
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    dataProvider : [],
    selected: null,
    selectGroupMap: {},
    hasGroup:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _listPropertiesChange(newVal) {

      let groupField = this.data.groupField;
      let cols = this.data.cols;
      let dataProvider = [], 
          hasGroup = false;

      if (groupField) {
        hasGroup = true;
        newVal.forEach(v=> {
          let groups = v[groupField];
          if (_.isArray(groups)) {
            v._list = array.splitRows(groups, cols)
            dataProvider.push(v);
          }
        }) 
      }
      else {
        dataProvider = array.splitRows(newVal, cols)
      }

      this.setData({
        hasGroup: hasGroup,
        dataProvider: dataProvider
      })
    },

    reset() {

      this.setData({
        selectGroupMap: {},
        selected: null
      })
      this.submit();
    },

    submitSelectedHandler(e) {
      let selectGroupMap = this.data.selectGroupMap;
      let selects = [];
      for (let f in selectGroupMap) {
        selects.push(selectGroupMap[f]);
      }
      this.submit(selects);
    },

    submit(selected) {
      let ds = {
        selected: selected,
        type:this.data.type
      }
      this.triggerEvent('change', ds);
    },

    selectChangeHandler(e) {

      let ds = e.currentTarget.dataset;
      let hasGroup = this.data.hasGroup;
      let groupKeyField = this.data.groupKeyField;
      let keyField = this.data.keyField;
      let selected = ds.selected;
      let selectGroupMap = this.data.selectGroupMap;
      if (hasGroup) {
        let selectKey = selected[groupKeyField];
        if (selectGroupMap[selectKey] && selectGroupMap[selectKey][keyField] == selected[keyField]) {
          delete selectGroupMap[selectKey];
        }
        else { 
          selectGroupMap[selectKey] = selected; 
        }
      }
      else {
        this.submit(selected);
      }
      //console.log('selectGroupMap', selectGroupMap);
      this.setData({
        selectGroupMap: selectGroupMap,
        selected: selected
      })
      //this.triggerEvent('itemClick', ds);
      //
      //console.log('selectChangeHandler', ds);
    }


  }
})
