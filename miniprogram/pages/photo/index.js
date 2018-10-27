const Sunrise = getApp().sunrise;

import config from './config';


const item0 = [{
  label: '件',
  value: 1
}, {
  label: '车',
  value: 2
}];
const item1 = [{
  label: '斤',
  value: 1
}, {
  label: '吨',
  value: 2
}, {
  label: '车',
  value: 3
}];

Sunrise.Page({

  services: [],

  events: {
    'sellerChange': 'onSellerChange',
    'unitChange': 'onUnitChange',
    'categoryChange': 'onCategoryChange',
    'marketChange': 'onMarketChange',
    'doSth': 'doSth'
  },

  data: {
    money: '0.00',
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
        fieldChange: function (data) {
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
        tips: '查看更多',
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
    form2: config.form2,
    form3: config.form3,
    marketAdmissionPictures: []
  },

  init(options) {

    this.form1 = this.selectComponent('#form1');
    this.form2 = this.selectComponent('#form2');
    this.form3 = this.selectComponent('#form3');

    this.units = ['斤', '吨', '车']

    if (options.sellerInfo) {
      this.sellerInfo = JSON.parse(options.sellerInfo)
      console.log(this.sellerInfo)
    }
    this.fillSellerInfo()
    if (options.marketItem) {
      console.log(JSON.parse(options.marketItem))
      let marketInfo = JSON.parse(options.marketItem)
      let goodsInfo = JSON.parse(options.goodsInfo)
      this.setData({
        category: goodsInfo,
        marketAdmissionPictures: marketInfo.elements.content[parseInt(options.index)].marketAdmissionPictures || []
      })

      let market = marketInfo.elements.content[options.index]
      market.admission = market.admission //parseFloat(market.admission) * 100
      this.onMarketChange(marketInfo.elements.content[options.index], goodsInfo)
    }
  },

  // 代卖人修改
  onSellerChange: function(e) {
    this.sellerInfo = e
    this.fillSellerInfo()
  },

  // 填写代卖人信息
  fillSellerInfo: function() {
    if (!this.sellerInfo) { // 如果页面传了代卖人信息过来，把表单数据填上
      return
    }
    this.service.sellinfo.getUnitInfo().then(unitList => {
      console.log('seller change', this.sellerInfo)
      this.service.sellinfo.getCarInfo().then(carList => {

        console.log(this.sellerInfo)
        this.form1.setValue({
          field7: this.sellerInfo.name
        });

        let cost = this.sellerInfo.commissionCostResponse

        this.form2.setValue({
          field10: cost.stallCostToYuan,
          field11: cost.workerCostToYuan,
          field12: {
            label: '约' + cost.unloadCostToYuan + '元/件',
          },
          field13: {
            label: '约' + cost.upsideDownCostToYuan + '元/吨',
          },
          field14: cost.incidentalCostToYuan,
        });

        //如果已选择了品类
        if (this.data.category) {
          this.initDate()
        }
      })
    })
  },

  // 监听重量单位的修改
  onUnitChange: function(unit) {
    debugger
    this.form3.changeField('field15', {
      tip: '元/' + unit.label
    })

    let items = unit.value === 3 ? item0 : item1;
    let selected = items[unit.value == 3 ? 0 : 0];

    this.form2.changeField('field8', {
      selected: selected,
      value: selected.label,
      show: false,
      ds: {
        title: '请选择单位',
        selectedValue: 1,
        selectedIndex: 0,
        items: items
      }
    })

    if (unit.value === 3) {
      this.units = ['件', '车']
    } else {
      this.form2.setValue({
        car: {
          hide: 1,
        },
      })
      this.units = ['斤', '吨', '车']
    }
    if (this.sellerInfo && this.data.category) {
      this.initDate()
    }

  },

  // 选择品种回调
  onCategoryChange: function(category) {
    console.log('category change', category)

    //保存品种信息
    this.setData({
      category: category
    })

    this.form1.changeField('field1', {
      value: category.name,
      selected: category.id
    })

    //如果有代买人信息
    if (this.sellerInfo) {
      this.initDate()
    }
  },

  // 选择市场回调
  onMarketChange: function(market, category) {
    console.log(market)
    this.setData({
      marketAdmissionPictures: market.marketAdmissionPictures || market.pictures || []
    })
    var newValue = {
      field5: market.marketName,
      field6: market.admission,
    }
    if (category) {
      newValue.field1 = category.cateName
    }
    this.form1.setValue(newValue);
  },

  // 点击计算利润
  doCalculate: function() {
    console.log('form', this.form1.getData(), this.form2.getData(), this.form3.getData());
    let formData1 = this.form1.getData(),
      formData2 = this.form2.getData(),
      formData3 = this.form3.getData()
    let checkNumber = function(val, tip) { // 检查是否空或者非数字
      if (isNaN(val)) {
        wx.showToast({
          title: tip,
          icon: 'none'
        })
        return false
      } else {
        return true
      }
    }

    let checkNumbers = function(val, tip) { // 检查是否空或者非数字
      if (!val || isNaN(val)) {
        wx.showToast({
          title: tip,
          icon: 'none'
        })
        return false
      } else {
        return true
      }
    }

    let zongzhongliang = formData1.field2.value // 总重量
    if (!checkNumbers(zongzhongliang, '请填写总重量')) return
    let yuguxiaoshoujia = formData3.field15.value // 预估销售价
    if (!checkNumbers(yuguxiaoshoujia, '请填写预估销售价')) return
    let shangchejia = formData1.field3.value // 上车价
    if (!checkNumbers(shangchejia, '请填写上车价')) return
    let yunfei = formData1.field4.value // 运费
    if (!checkNumbers(yunfei, '请填写运费')) return


    let jinchangfeiyong = formData1.field6.value // 进场费用
    if (!jinchangfeiyong || isNaN(jinchangfeiyong)) {
      jinchangfeiyong = 0
    }
    // if (!checkNumber(jinchangfeiyong, '请填写进场费用')) return

    let daimaifei = formData2.field9.value // 代卖费
    if (!checkNumber(daimaifei, '请填写代卖费')) return
    let dangkoufei = formData2.field10.value // 档口费
    if (!checkNumber(dangkoufei, '请填写档口费')) return
    let xiaoshoutianshu = formData3.field16.value // 销售天数
    if (!checkNumbers(xiaoshoutianshu, '请填写销售天数')) return
    let xiaogongfei = formData2.field11.value // 小工费
    if (!checkNumber(xiaogongfei, '请填写小工费')) return
    let xiechefei = formData2.field12.value // 卸车费
    if (!checkNumber(xiechefei, '请填写卸车费')) return
    let daobaofei = formData2.field13.value // 倒包费
    if (!checkNumber(daobaofei, '请填写倒包费')) return
    let zafei = formData2.field14.value // 杂费
    if (!checkNumber(zafei, '请填写杂费')) return


    // 利润=预估销售价*总重量-上车价*总重量-运费-进场费用-代卖费*总重量-档口费*销售天数-小工费*销售天数-卸车费-倒包费-杂费

    let total = 1
    if (formData2.field8.value === formData1.field2.selected.label) {
      total = zongzhongliang
    } else if (formData2.field8.value === '吨' && formData1.field2.selected.label === '斤') {
      total = zongzhongliang / 2000
    } else if (formData2.field8.value === '斤' && formData1.field2.selected.label === '吨') {
      total = zongzhongliang * 2000
    }

    this.setData({
      money: (yuguxiaoshoujia * zongzhongliang - shangchejia * zongzhongliang - yunfei - jinchangfeiyong - daimaifei * total - dangkoufei * xiaoshoutianshu - xiaogongfei * xiaoshoutianshu - xiechefei - daobaofei - zafei).toFixed(2)
    })

    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },


  //初始化数据（选择品种或代买人后）
  initDate() {
    let cateList = this.sellerInfo.commissionMajorBusinessList
    cateList.forEach(item => {
      if (item.cateId === (this.data.category.cateId || this.data.category.id)) {
        let index = this.units.indexOf(item.unitName)
        console.log(this.units[index + 1])
        if (index !== -1) {
          if (item.commissionCarModelCostList.length) {
            let data = item.commissionCarModelCostList[0]
            console.log(data)
            this.form2.setValue({
              field8: {
                selected: {
                  value: index + 1
                },
                value: this.units[index],
              },
              car: {
                hide: 0,
                selected: {
                  value: data.carModelId
                },
                value: data.carModelName
              },
              field9: data.costAmountToYuan,
            })
          } else {
            this.form2.setValue({
              field8: {
                selected: {
                  value: index + 1
                },
                value: this.units[index]
              },
              car: {
                hide: 1,
                selected: {
                  value: 1
                },
                value: '4.2米'
              },
              field9: item.commissionCostToYuan,
            })
          }
        }
      }
    })
  },

  handledoSth() {
    let url = this.data.marketAdmissionPictures
    if (!url.length) return
    let urls = []
    url.forEach(item => {
      urls.push(item.url)
    })
    wx.previewImage({
      current: '', // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },

  //上传
  doUpload() {
    this.selectComponent('#images').upload(res => {
      console.log(res)
    }, err => {
      wx.showToast({
        title: '上传失败，请稍后重试',
        icon: 'none'
      })
    })
  }
});