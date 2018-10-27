// packages/seach-bar/index.js
const _ = require('../../utils/attr.js')

const defaultLabels = { // 默认菜单
  category: {
    label: '全部分类',
    type: 'category'
  },
  area: {
    label: '全国',
    type: 'city'
  },
  breed: {
    label: '品种',
    type: 'breeds'
  },
  spec: {
    label: '规格',
    type: 'specifications'
  }
}

const defaultSelected = { // 默认选中项
  category: {
    name: ''
  },
  type: '' // 选中的菜单类型
}

const _defaultOptions = { // 默认配置
  hasBreedAndSpec: true, // 是否有规格和品种选择
  hasBreed: undefined, // 是否有品种选择，优先级比hasBreedAndSpec高
  hasSpec: undefined, // 是否有规格选择，优先级比hasBreedAndSpec高
  hasCategory: true, // 是否有分类选择
  hasArea: true, // 是否有地区选择
  area: { // 地区选择控件的参数
    showLevel: 2
  },
  category: {}, // 分类选择控件的参数
  custom: [] // 自定义选择条件和数据源
}

/**
 * 超过4个字符省略中间部分
 */
const _splitChars = str => {
  if (str && str.length > 4) {
    let strLen = str.length;
    return [str.charAt(0), '..', str.charAt(strLen - 2), str.charAt(strLen - 1)].join('');
  }
  return str;
}

const Sunrise = getApp().sunrise;

Sunrise.Component({
  /**
   * 自定义class
   */
  externalClasses: ['my-custom', 'search-custom'],
  /**
   * 组件的属性列表
   */
  properties: {

    options: {
      type: Object,
      value: _defaultOptions,
      observer: function(newVal, oldVal) {
        this._onOptionsChange(newVal);
      }
    },

    selector: {
      type: String,
      value: '.sr_search_bar'
    },

    selected: {
      type: Object,
      value: defaultSelected,
      observer: function(newVal, oldVal) {
        this._selectedPropertiesChange(newVal);
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    searchList: [],
    breeds: [],
    specifications: [],
    customSearch: []
  },

  detached: function() { // 组件离开父组件时，重置
    this.setData({
      searchList: [],
      selected: defaultSelected
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {

    _selectedPropertiesChange(newVal) {
      if (newVal && newVal.category) {
        let cateId = newVal.category.cateId3 || newVal.category.cateId1;
        this.sendBreedAndSpec(cateId, newVal.category.name);
      }
    },

    init() {
      this.result = {}
      if (this.data.options.showCategory) { // 兼容旧的showCategory属性
        let selected = defaultSelected
        selected.type = defaultLabels.category.type
        this.setData({
          selected: selected
        })
      }
    },

    _onOptionsChange(newVal) { // options参数变化触发
      let options = _.applyIf(newVal, _defaultOptions);
      let searchList = []
      if (options.hasCategory) {
        searchList.push(Object.assign({}, defaultLabels.category))
      }
      if (options.hasArea) {
        searchList.push(Object.assign({}, defaultLabels.area))
      }
      let customSearch = this.data.options.custom // 自定义搜索菜单
      if (customSearch.length) {
        customSearch.forEach((val, index, array) => {
          searchList.push({
            label: val.label,
            type: val.type
          })
          if (val.ds.service) { // 如果数据源是通过接口拿
            let service = Sunrise.context.getBean(val.ds.service)
            service[val.ds.method](val.ds.params).then(res => {
              let result = val.ds.listField ? res[val.ds.listField] : res
              array[index].ds = result.map(resultItem => {
                return {
                  name: resultItem[val.ds.nameField],
                  value: resultItem
                }
              })
              this.setData({
                customSearch: array
              })
            })
          }
        })
      }
      this.setData({
        options,
        customSearch,
        searchList: searchList
      })
    },

    showHandler(e) { // 点击顶部的菜单栏，控制显示/隐藏
      let item = e.currentTarget.dataset.item;
      let type = item.type
      let selected = this.properties.selected
      // 回调页面方法，告诉列表是否已经关闭了
      this.triggerEvent('isCategoryShow', (selected.type == type ? "hide" : "show"));
      if (type == selected.type) {
        selected.type = ''
      } else {
        selected.type = type
      }
      this.setData({
        selected: selected
      })
    },

    changeCityHandler(e) { // 地区选择回调
      let city = e.detail
      if (city) {
        this.updateSearchList(defaultLabels.area.type, city.areaName)
        this._submit(defaultLabels.area.type, city);
      } else {
        delete this.result.city
        this.updateSearchList(defaultLabels.area.type, '全国')
        this._submit();
      }
    },

    // 更新搜索条的label
    updateSearchList: function(typeName, label) {
      this.setData({
        searchList: this.data.searchList.map(val => {
          if (val.type == typeName) {
            // val.label = _splitChars(label) // 改为由css自动控制
            val.label = label
          }
          return val
        })
      })
    },

    // 添加东西到搜索条
    addToSearchList: function(val, index) {
      let temp = this.data.searchList
      index = index == undefined ? temp.length : index
      if (Array.isArray(val)) {
        temp.splice(index, 0, ...val)
      } else {
        temp.splice(index, 0, val)
      }
      this.setData({
        searchList: temp
      })
    },

    // 从搜索条中删除
    removeFromSearchList: function(typeName) {
      this.setData({
        searchList: this.data.searchList.filter(val => {
          if (val.type == typeName) {
            return false
          }
          return true
        })
      })
    },

    sendBreedAndSpec(cateId, label) { // 查询品种和规格

      // debugger
      this.updateSearchList(defaultLabels.category.type, label)
      if (cateId) {
        Sunrise.http.send({
          noLogin: true,
          url: Sunrise.config.bananaApi + "/category/query/spec/breed",
          data: {
            "cateId": cateId
          },
          success: res => {
            let breeds = res.breeds;
            let specifications = res.specifications;

            let searchList = []
            let options = this.properties.options
            if (breeds && breeds.length) {
              if (options.hasBreedAndSpec && options.hasBreed !== false) {
                searchList.push(Object.assign({}, defaultLabels.breed))
              }
            }
            if (specifications && specifications.length) {
              if (options.hasBreedAndSpec && options.hasSpec !== false) {
                searchList.push(Object.assign({}, defaultLabels.spec))
              }
            }
            searchList.length && this.addToSearchList(searchList, 1);

            this.setData({
              breeds: breeds,
              specifications: specifications
            })
          }
        });
      }
    },

    changeCategoryHandler(e) { // 类目改变触发
      let category = e.detail
      let resetBreedAndSpec = () => {
        this.removeFromSearchList(defaultLabels.breed.type)
        this.removeFromSearchList(defaultLabels.spec.type)
        delete this.result.breeds
        delete this.result.specifications
      }
      if (category) { // 选了某个类目
        let cateId = category.id;
        // 如果选的类目跟之前的不一样，才进行下面的操作
        if (!(this.result.category && this.result.category.id == cateId)) {
          resetBreedAndSpec()
          this._submit(defaultLabels.category.type, category);

          if (this.data.options.hasBreedAndSpec || this.data.options.hasBreed || this.data.options.hasSpec) {
            this.sendBreedAndSpec(cateId, category.name);
          } else {
            this.updateSearchList(defaultLabels.category.type, category.name)
          }
        } else {
          this.clearSelected()
        }
      } else { // 选了全部分类
        delete this.result.category
        this.updateSearchList(defaultLabels.category.type, defaultLabels.category.label)
        resetBreedAndSpec()
        this._submit()
        this.clearSelected()
      }
    },

    changeHandler(e) { // 选择品种和规格
      let detail = e.detail;
      if (detail.type == defaultLabels.breed.type) { // 选品种的话要更新上面的label
        this.updateSearchList(defaultLabels.breed.type, detail.selected.name)
      }
      this._submit(detail.type, detail.selected);
    },

    _submit(resultType, data) { // 回调父组件, 把selected.type清空
      this.clearSelected()
      if (resultType) {
        this.result[resultType] = data
      }
      this.triggerEvent('change', this.result);
      // 选中内容，通知列表已经关闭了
      this.triggerEvent('isCategoryShow', 'hide');
    },

    clearSelected: function() { // 清除选中状态
      let tmp = this.properties.selected
      tmp.type = ''
      this.setData({
        selected: tmp
      })
    },

    onCustomItemClick: function(e) { // 点击自定义的菜单
      let temp = this.properties.selected
      let index = e.currentTarget.dataset.index
      temp[temp.type] = {
        index: index
      }
      this.setData({
        selected: temp
      })
      let search = this.data.customSearch.filter(val => {
        return val.type == temp.type
      })[0]
      if (search.updateLabel) {
        this.updateSearchList(temp.type, search.ds[index].name)
      }
      this._submit(temp.type, search.ds[index].value)
    }
  }

})