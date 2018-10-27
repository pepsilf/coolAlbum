// packages/category/index.js

const Popup = require('../../utils/behavior/popup.js')
const array = require('../../utils/array.js')

const Sunrise = getApp().sunrise;
const _ = Sunrise._;

let defaultOptions = {
  beanId: '$@hn.CategoryService',
  method: 'find',
}

Sunrise.Component({

  name:'Category',

  mixins: [Popup],

  services: ['$@hn.CategoryService'],

  properties: {
    noAll: {
      type: Boolean,
      value: true
    },
    
    selected: {
      type: Object,
      value: {}
    },

    options: { // 配置
      type: Object,
      value: defaultOptions
    },

    showBreed: Boolean // 是否显示品种选择
  },

  /**
   * 组件的初始数据
   */
  data: {
    categorys: null,
    selectIndex: 0,
    categoryItems: null,
    showBreedSelector: false,
  },


  /**
   * 组件的方法列表
   */
  methods: {

    init() {
      let options = _.applyIf(this.data.options, defaultOptions);
      this.setData({ options });
    },

    _showPropertiesChange(newVal) {
      if (newVal && !this.data.categorys) {
        this.requeseCategorys();
      }
      !newVal && this.setData({
        showBreedSelector: false,
        breeds: []
      })
    },


    tapCategoryHandler(e) {
      let dataset = e.currentTarget.dataset;
      if (dataset.index == 0) { // 选了全部
        this.triggerEvent('change');
      } else {
        this.requeseCategorys(dataset.code);
        this.setData({
          selelctIndex: dataset.index
        });
      }
    },

    chooseAllHandler(e) {
      let d = this.data.categorys ? this.data.categorys[this.data.selelctIndex] : null;
      this.selectChangeHander(this.data.categorys ?
        this.data.categorys[this.data.selelctIndex] : null);
    },

    chooseCategoryHandler(e) {
      let dataset = e.currentTarget.dataset;
      this.selectChangeHander(dataset.selected);
    },

    selectChangeHander(d) {
      this.result = d
      if (!this.properties.showBreed) {
        this.callback()
      } else {
        this.service.hn.$category.findBreeds(d.id).then(res => {
          if (res.breeds && res.breeds.length) {
            this.setData({
              showBreedSelector: true,
              breedList: res.breeds
            })
          } else {
            this.callback()
          }
        }).catch(() => {
          this.callback()
        })
      }
    },

    callback: function() { // 隐藏并回调父组件
      this.setData({
        show: false
      })
      this.triggerEvent('change', this.result);
    },

    // 点击选择品种
    chooseBreedHandler: function(e) {
      let breed = e.detail.selected
      this.result.breedId = breed.id
      this.result.breedName = breed.name
      this.callback()
    },


    /**
     * 请求类目数据
     */
    requeseCategorys(code) {

      let options = this.data.options;
      let beanId = options.beanId || defaultOptions.beanId;
      let method = options.method || defaultOptions.method;
      let params = options.params || {};

      let service = Sunrise.context.getBean(beanId)
      service[method](code, params).then(res => {

        if (code) {
          let categoryItems = array.sortGroupByFirstChar(res,'pinyin',3);
          this.setData({
            categoryItems
          })
        }
        else {

          res = _.isArray(res) ? res : [];
          let selectIndex = 0;
          /**
           * 过滤要求显示的数据
           */
          let idFilter = options.idFilter;
          if (_.isArray(idFilter) && idFilter.length) {
            res = array.filter(res, idFilter,'id');
          }

          res.unshift({
            name: '全部分类'
          })
          
          if (res && res.length > 1) {
            selectIndex = 1;
            let selectItem;
            let selected = this.data.selected;
            let selectedField = options.selectedField || 'cateId1';
            if (selected && selected[selectedField]) {
              selectIndex = array.indexAt(res, selected[selectedField], 'id')
              selectItem = selectIndex != -1 ? res[selectIndex] : null;
            }

            if (!selectItem) {
              selectItem = res[selectIndex];
            }

            if (!this.data.categoryItems) {
              this.requeseCategorys(selectItem.id);
            }
          }

          this.setData({
            selelctIndex: selectIndex,
            categorys: res
          })

        }
      })
    }


  }
})