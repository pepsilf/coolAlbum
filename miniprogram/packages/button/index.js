// components/button/index.js

const Sunrise = getApp().sunrise;

/**
 * 
 * Button
 * 
 * 1、支持登录
 * 2、支持用户授权
 * 3、支持分享
 *  
 */
Sunrise.Component({

  externalClasses: ['custom-class','margin-class'],
  /**
   * 组件的属性列表
   */
  properties: {

    eventID : String,

    eventQuery : {
      type:Object,
      value:{}
    },

    openType : {
      type:String,
      value:''
    },

    formType: {
      type: String,
      value: ''
    },

    backgroundColors:{
      type:Array,
      value:[]
    },

    borderColor:{
      type: String,
      value: ''
    },

    color:{
      type: String,
      value: ''
    },

    height:{
      type: Number,
      value: 44
    },

    hasAuth: {
      type:Boolean,
      observer: function (newVal, oldVal) {
        this._changeAuthObserver(newVal);
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isOpenType: false
  },

  /**
   * 组件的方法列表
   */
  methods: {

    _changeAuthObserver(newVal) {
      this.setData({ isOpenType: !newVal });
    },

    init() {

      if (this.data.openType) {
        let isOpenType = true;
        if (this.data.openType == 'getPhoneNumber') {
          isOpenType = !Sunrise.weapp.setting.hasUserPhonenumber;
        }
        else if (this.data.openType == 'getUserInfo') {
          isOpenType = !Sunrise.weapp.setting.hasUserInfo;
        }
        this.setData({ isOpenType });
      }

    },

    handlerTap(e) {
      if (this.data.isOpenType) {
        this.triggerEvent('fail');
        return;
      }
      if(this.data.eventID) {
        Sunrise.mta.stat(this.data.eventID, this.data.eventQuery);
      }
      this.triggerEvent('handler');
    },

    bindGetUserinfo(e) {
      if(Sunrise.weapp.registerUserInfo(e.detail)) {
        this.setData({ isOpenType : false });
        this.handlerTap(e);
      }
    },

    bindGetPhonenumber(e) {
      if (Sunrise.weapp.registerUserPhonenumber(e.detail)) {
        this.setData({ isOpenType : false });
        this.handlerTap(e);
      }
    }

  }
})
