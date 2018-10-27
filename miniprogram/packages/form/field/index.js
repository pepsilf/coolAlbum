// packages/form/field/index.js

const Sunrise = getApp().sunrise;

const _ = Sunrise._;

Sunrise.Component({


  externalClasses: ['field-class'],

  /**
   * 组件的属性列表
   */
  properties: {

    show: Boolean,

    options: {
      type: Object,
      value: {},
      observer: function (newVal, oldVal) {
        this._optionsPropertiesChange(newVal, oldVal);
      }
    },

    isPreview: {
      type: Boolean,
      value: false
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    type:'input',
    disabled:false,
    inputType:'text',
    placeholder:'',
    maxLength:150,
    valueLength: 0,
    isHide:false,
    cellUpdateTimeout:0
  },

  /**
   * 组件的方法列表
   * 
   */
  methods: {

    _optionsPropertiesChange(newVal, oldVal) {


      // 用 setTimeout 减少计算次数
      if (this.data.cellUpdateTimeout > 0) {
        clearTimeout(this.data.cellUpdateTimeout);
      }

      let _this = this;
      var cellUpdateTimeout = setTimeout(function () {
        _this.setData({ cellUpdateTimeout: 0 });

        let data = _.apply({
          type: 'input',
          disabled: false,
          inputType: 'text',
          placeholder: '',
          selected: {},
          maxLength: 150
        }, newVal);

        if (data.type == 'textarea' && _.isString(newVal.value)) {
          data.valueLength = newVal.value.length;
        }

        //console.log('d', _this.data)
        _this.setData(data);
      });
      this.setData({ cellUpdateTimeout: cellUpdateTimeout });
    },

    handlerHide() {
      this.setData({
        show: false
      })
      this.triggerEvent('hide');
    },

    handlerSelectChange(e) {
      this.handleFieldChange(e, e.detail)
    },

    handlerPopperSelectChange(e) {
      this.handleFieldChange(e, e.detail)
    },

    handleFieldChange(e,selected) {
      let item = e.detail;
      let field = this.data.field;
      //this.data.type == 'textarea' && e.detail && this.setData({})
      this.triggerEvent('change', { field, value: e.detail, selected });
    },

    handlerPopperTap(e) {
      this.setData({
        show: true
      })
      this.triggerEvent('show');
    },

    /**
     * 隐藏或显示原生组件
     */
    showOrHideNativecCmponents(isHide) {
      if (this.data.type != 'textarea') return;
      this.setData({ isHide })
    },

    handledoSth() {
      this.triggerEvent('handledoSth');
    }
  }
})
