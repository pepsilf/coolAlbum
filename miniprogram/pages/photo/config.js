const Sunrise = getApp().sunrise

export default {
  form1: {
    items: [{
        title: '选取品种',
        tip: '请选择品种',
        field: 'field1',
        path: '/pages/base-info/sub/selectSell/index?from=calculator'
      },
      {
        title: '总重量',
        type: 'input',
        field: 'field2',
        inputType: 'digit',
        placeholder: '输入总重量',
        fieldChange: function(data) {
          Sunrise.event.fire('unitChange', [data])
        },
        ds: {
          title: '请选择单位',
          selectedValue: 1,
          selectedIndex: 0,
          items: [{
              label: '斤',
              value: 1
            },
            {
              label: '吨',
              value: 2
            },
            {
              label: '件',
              value: 3
            }
          ]
        }
      },
      {
        title: '上车价',
        tip: '元/${field2.selected.label}',
        placeholder: '请输入',
        inputType: 'digit',
        type: 'input',
        field: 'field3'
      },
      {
        title: '运费',
        tip: '元',
        placeholder: '请输入',
        inputType: 'digit',
        type: 'input',
        field: 'field4'
      },
      {
        title: '所在市场',
        tip: '请选择您所在的市场',
        field: 'field5',
        path: '/pages/base-info/sub/sellMarket?from=calculator'
      },
      {
        title: '进场费用',
        tips:'查看更多',
        placeholder: '可手动修改',
        // tip: '元',
        type: 'input',
        inputType: 'text',
        field: 'field6',
      },
      {
        title: '代卖人',
        tip: '选择一个代卖人',
        field: 'field7',
        path: '/pages/seller-select/index'
      },
    ]
  },

  form2: {
    items: [{
        title: '代卖费单位',
        field: 'field8',
        type: 'select',
        fieldChange: function(data) {
          this.toggleField(['car'], data.label !== '车');
        },
        ds: {
          title: '请选择单位',
          selectedValue: 1,
          selectedIndex: 0,
          items: [{
              label: '斤',
              value: 1
            },
            {
              label: '吨',
              value: 2
            },
            {
              label: '车',
              value: 3
            }
          ]
        }
      },
      {
        title: '车型选择',
        field: 'car',
        type: 'select',
        hide: true,
        ds: {
          selectedValue: 1,
          selectedIndex: 0,
          title: '车型选择',
          scrollHeight: 500,
          beanId: 'SellinfoService',
          method: 'getCarInfo',
          labelField: 'name',
          valueField: 'id',
        }
      },
      {
        title: '代卖费',
        tip: '元/${field8.selected.label}',
        placeholder: 0,
        inputType: 'digit',
        type: 'input',
        field: 'field9'
      },
      {
        title: '档口费',
        tip: '元/天',
        placeholder: 0,
        inputType: 'digit',
        type: 'input',
        field: 'field10'
      },
      {
        title: '小工费',
        tip: '元/天',
        placeholder: 0,
        inputType: 'digit',
        type: 'input',
        field: 'field11'
      },
      {
        title: '卸车费',
        tip: '元',
        placeholder: 0,
        inputType: 'digit',
        type: 'input',
        field: 'field12'
      },
      {
        title: '倒包费',
        tip: '元',
        placeholder: 0,
        inputType: 'digit',
        type: 'input',
        field: 'field13'
      },
      {
        title: '杂物费',
        tip: '元',
        placeholder: 0,
        inputType: 'digit',
        type: 'input',
        field: 'field14'
      },
    ]
  },



  form3: {
    items: [{
        title: '预估销售价',
        tip: '元/斤',
        placeholder: '请输入',
        inputType: 'digit',
        type: 'input',
        field: 'field15'
      },
      {
        title: '销售天数',
        tip: '天',
        placeholder: '请输入',
        inputType: 'number',
        type: 'input',
        field: 'field16'
      }
    ]
  }
};