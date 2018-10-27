const Sunrise = getApp().sunrise;

import _ from '../attr.js';
const Dialog = require('../../dialog/dialog.js');

const customerPhoneNumber = "4000088688";

const failMessageConfig = {
  "7175001": {
    msg: "您的帐号存在风险，暂不能进行操作，如有疑问请联系客服。",
    hasCallCustomer: true
  },
  "7175002": {
    msg: "您今天聊天的人数已达上限，请明天再来！如有疑问请联系客服。",
    hasCallCustomer: true
  },
  "7175003": {
    msg: "您今天聊天的人数已达上限，请明天再来！如有疑问请联系客服。",
    hasCallCustomer: true
  },
  "7175004": {
    msg: "与该用户交易存在风险，请选择其他商家！"
  },
  "7175005": {
    msg: "你与该用户交易可能存在风险，还有更多商家可供您选择！"
  }
}

module.exports = {

  init: function(next) {
    this.userService = Sunrise.context.getBean('@login')

    let dialogCtx = this.selectComponent("#call_dialog");
    if (!dialogCtx) {
      console.error('无法找到对应call_dialog的dialog组件，请于页面中注册并在 wxml 中声明一个id为call_dialog 的 dialog 自定义组件');
      return;
    }
    this.dialogCtx = dialogCtx;
    next();
  },

  _sendCall(hnUserId, businessType) {

    Dialog({
      title: '正在转接...',
      message: '本次通话将转接至惠农安全电话保护隐私，交易更安全',
      showConfirmButton: false,
      selector: '#call_dialog'
    });

    this.userService.call(hnUserId, businessType).then(res => {
      this._dialogPhoneCall(res);
    }).catch(err => {
      this._callFailPhoneCall(err);
    })
  },

  _callFailPhoneCall(error) {

    let errorCode = error.code || error.errorCode;

    this.dialogCtx.hide();
    if (!error.data) {
      wx.showToast({
        title: error.message || error.msg,
        icon: 'none'
      })
      return;
    }

    let failMessage = failMessageConfig[error.data.code];
    if (failMessage) {

      let buttons = [{
        text: '我知道了',
        type: 'cancel',
        color: '#3CC51F'
      }];

      if (failMessage.hasCallCustomer) {
        buttons.push({
          text: '致电客服',
          type: 'callCustomer'
        });
      }

      Dialog({
        title: '呼叫失败',
        message: failMessage.msg,
        selector: '#call_dialog',
        buttons: buttons
      }, this).then(({
        type
      }) => {
        if (type == 'callCustomer') {
          wx.makePhoneCall({
            phoneNumber: customerPhoneNumber
          })
        }
      });
    }
  },

  _dialogPhoneCall(res) {
    if (this.dialogCtx) {
      this.dialogCtx.hide();
      wx.makePhoneCall({
        phoneNumber: res.messageTitle
      })
    }
  },

  doCall(hnUserId, businessType) {
    this.userService.getUserId(true).then(myUserId => {
      this._sendCall(hnUserId, businessType);
    })
  }
}