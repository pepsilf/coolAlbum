// packages/@hn/auth/index.js
const Sunrise = getApp().sunrise;

Sunrise.Component({
  /**
   * 组件的属性列表
   */
  properties: {
    message: String,

    confirmText: {
      type: String,
      value: '确定微信信息授权'
    },

    title: {
      type: String,
      value: '是否微信信息授权？'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show:false
  },

  events:{
    '$wechatAuth':'_wechatAuthHandler'
  },

  /**
   * 组件的方法列表
   */
  methods: {
      init() {
        let show = !Sunrise.weapp.setting.hasUserInfo;
        if (show) {
          Sunrise.$dialog({
            title: this.data.title,
            selector: '#call-modal',
            message: this.data.message,
            buttons: [{
              type: 'confirm',
              openType: 'getUserInfo',
              text: this.data.confirmText
            }]
          }, this).then(res => {
            this.triggerEvent('auth');
          })
        }
      },

      _wechatAuthHandler(e) {
        var dialogCtx = this.selectComponent('#call-modal');
        dialogCtx && dialogCtx.hide();
      }
  }
})
