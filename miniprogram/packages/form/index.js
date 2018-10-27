// packages/form/index.js
const Sunrise = getApp().sunrise;
const _ = Sunrise._;
const util = Sunrise.util;

const array = require('../utils/array.js');
const validate = require('../utils/validate.js');

const TYPE_SELECTS = ['select'];

Sunrise.Component({

  /**
   * 组件的属性列表
   */
  properties: {

    options: {
      type:Object,
      value: {},
      observer: function (newVal, oldVal) {
        this._optionsPropertiesChange(newVal, oldVal);
      }
    },

    isPreview : {
      type:Boolean,
      value:false
    }

  },


  events:{
    '$fieldValueChange': '_fieldValueChangeHandler',
    '$pop-show': '_showPopperHandler'
  },

  /**
   * 组件的初始数据
   */
  data: {
    title : '',
    items : [],
    validators : {}
  },

  /**
   * 组件的方法列表
   */
  methods: {


    _optionsPropertiesChange(newVal, oldVal) {
      let title = newVal.title || '';
      let items = [];
      let validators = {};

      let pomises = [];
      let isWait = false;
      if (_.isArray(newVal.items)) {
        newVal.items.forEach( v => {
          v = _.apply({
            isLink:false,
            maxLength:150,
            selected:{},
            show:false,
            rigth: true
          },v)
          if (v.path || TYPE_SELECTS.indexOf(v.type) != -1) {
            v.isLink = true;
          }
          let p = this.setDs(v);
          if (p instanceof Promise) {
            pomises.push(p);
          }

          if(_.isString(v.tip) && v.tip.indexOf('$') != -1) {
            isWait = true;
            v._tip = v.tip;
          }
          items.push(v);

          //let validators = {};
          if (v.field && v.validate) {
            validators[v.field] = v.validate
          }

        });
      }

      if (pomises.length && isWait) {
        Promise.all(pomises).then(rs => {
          this.setData({ title, validators });
          this._formatTip(items);
          this.hasReady = true;
        })
      }
      else {
        this.setData({ title, validators })
        this._formatTip(items);
        this.hasReady = true;
      }
      //console.log(_.toField('hehe:${name.n}', { name: { n: 'zhouhan' } }))
    },


    setDs(v) {
      let ds = v.ds;
      if(ds) {

        if (ds.items) {
          ds.selectedIndex = ds.selectedIndex || 0;
          v.selected = ds.items[ds.selectedIndex] || {};

          if (v.isLink && v.selected) {
              v.value = v.selected.label
          }
        }
        //labelField:'areaName',
        //valueField: 'id',
        else {
          if (ds.beanId && ds.method) {
            let service = Sunrise.context.getBean(ds.beanId);
            let method = service[ds.method];

            if (service && _.isFunction(method)) {
              return method.call(service, ds.params).then(res => {
                if(_.isArray(res)) {
                  if (ds.labelField && ds.valueField) {
                    let items = [];
                    res.forEach(d => {
                      items.push({
                        label: d[ds.labelField],
                        value: d[ds.valueField],
                      })
                    });
                    v.ds.items = items;
                  }
                  else {
                    v.ds.items = res;
                  }
                  this.setDs(v);
                }
                else {
                  console.warn('ds.items is must Array');
                }
              })
            }
          }
        }
      }
    },

    /**
     * 刷新数据
     */
    refresh(val, items) {
      items = items || this.data.items;
      let tips = [];
      //console.log('items',items)
      items.forEach(v => {
        v._tip && tips.push(v);
      })

      if (tips.length) {
        let data = _.apply(this._getData(items), val || {})
        tips.forEach(v => {
          v.tip = _.toField(v._tip, data)
        })
        //console.log('items - itps', items, data)
      }
      this.setData({ items });
    },

    _formatTip(items) {
      this.refresh({}, items);
    },


    _getData(items) {
      items = items || this.data.items;
      let data = {};
      items.forEach(v => {
        if (v.field && !v.hide) {
          data[v.field] = {
            selected: v.selected,
            value: v.value || ''
          }
        }
      })
      return data;
    },

    getData() {
      let data = this._getData(this.data.items);
      let errorMessages = validate.doValidate(this.data.validators, data,'value');
      if (errorMessages.length) {
        let errorMsg = errorMessages[0].errorMsg;
        wx.showToast({
          title: errorMsg,
          icon: 'none'
        })
        return;
      }
      return data;
    },

    /**
     * 设置Form的属性值
     */
    setValue(d) {

      if (Sunrise.util.wait(this, 'hasReady' , 'setValue', [d])) {
        if (_.isObject(d)) {
          for (var f in d) {
            let item = this._findField(f);
            if (item) {
              let v = d[f];
              if (_.isObject(v)) {
                v.selected = (function (selected) {
                  if (item.ds && item.ds.items && selected && selected.value != undefined) {
                    return array.indexAtItem(item.ds.items, selected.value, 'value');
                  }
                  return selected;
                })(v.selected);
                //item.hide = v.hide;
                v.value = v.value ? v.value : item.selected ? item.selected.label : '';

                item = _.apply(item,v);
              }
              else {
                item.value = v;
              }
            }
          }
          this._formatTip();
        }
      }
    },


    /**
     * 后期改造成 按需加载所需数据
     */
    handlerTap(e) {

      let d = e.currentTarget.dataset;
      let index = d.index;
      let items = this.data.items;
      let item = items[index];

      if (!item.isLink) return;
      items.forEach((v,i)=> {
        v.show = v.type == 'select' && i == index;
      })
      this.setData({ items });
      this.triggerEvent('click', item);
    },

    handlerHide() {
      let items = this.data.items;
      items.forEach(v => {
        v.show = false;
      });
      this.setData({ items });
    },


    handlerFieldChange(e) {

      let d = e.currentTarget.dataset;
      let detail = e.detail;
      let items = this.data.items;
      let item = items[d.index];
      let value = detail.value.value || detail.value.label;
      //console.log('detail', detail)

      //debugger
      item.selected = detail.selected || item.selected || {};
      if (item.type == 'select') {
        item.show = false;
        item.value = detail.value.label;
      }
      else {
        if (!detail.selected) {
          item.value = value;
        }
      }

      if (_.isFunction(item.fieldChange)) {
        item.fieldChange.call(this, item.selected)
      }
      //this.setData({ items });
      this._formatTip(items);
      this.triggerEvent('change', item);
    },

    
    fieldChange(options) {
      let fields = _.isArray(options) ? options : [options];
      fields.forEach(v => {
        let f = this._findField(v.field);
        if (f) {
          f = _.apply(f, v);
          // item.selected = v.selected;
          // item.value = v.value;
        }
      })
      this._formatTip();
    },

    hideField(...fields) {
      this.toggleField(fields, false);
      return this;
    },

    showField(...fields) {
      this.toggleField(fields, true);
      return this;
    },
    
    toggleField(fields,val) {
      if (fields.length) {
        let hasUpdate = false;
        fields.forEach(v => {
          var f = this._findField(v);
          f && (hasUpdate = true, f.hide = val)
        })
        this._formatTip();
      }
      return this;
    },

    /**
     * 改变 Form 值
     */
    changeField(field,data) {

      if (!_.isObject(data)) {
        console.error('method changeField args data is Object type.')
        return;
      }
      var f = this._findField(field);
      if(f) {
        f = _.apply(f,data);
        // f.selected = data.selected || {};
        // f.value = data.value;
        // f.tip = data.tip == undefined ? f.tip : data.tip
        this._formatTip();
      }
    },

    _fieldValueChangeHandler(value) {
      this.setValue(value);
      this.triggerEvent('change', value);
    },

    // _fieldChangeHandler(options) {
    //   this.fieldChange(options);
    //   this.triggerEvent('change', options);
    // },

    _findField(field) {
      let items = this.data.items;
      return array.indexAtItem(items, field, 'field');
    },


    // _showDialogHandler() {
    //   this._showOrHideTextArea(true);
    // },


    // _hideDialogHandler() {
    //   this._showOrHideTextArea(false);
    // },


    _showPopperHandler(isHide,pageCtx) {
      if (this.uuid != pageCtx.uuid)
        return;

      var fieldItems = this.selectAllComponents('.sr_field')
      fieldItems.forEach(v => {
        v.showOrHideNativecCmponents(isHide);
      })

    },

    handledoSth() {
      this.triggerEvent('handledoSth');
    }

  }
})
