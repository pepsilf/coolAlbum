'use strict';

const _ = require('../attr.js')

module.exports = function (Sunrise) {


  Sunrise.$hideDialog = function (params) {
    if (globalDialog && _.isFunction(globalDialog.hide)) {
      globalDialog.hide(params);
    }
  }

  let globalDialog;
  // options 使用参数
  // pageCtx 页面 page 上下文
  function Dialog(options, pageCtx) {
    //var parsedOptions = Object.assign({}, defaultData, options);
    var parsedOptions = _.apply({
      // 标题
      title: '',
      // 自定义 btn 列表
      // { type: 按钮类型，回调时以此作为区分依据，text: 按钮文案, color: 按钮文字颜色 }
      buttons: [],

      buttonHeight: 44,
      // 内容
      message: '',
      // 选择节点
      selector: '#call-dialog',
      // 按钮是否展示为纵向
      buttonsShowVertical: false,
      // 是否展示确定
      showConfirmButton: true,
      // 确认按钮文案
      confirmButtonText: '确定',
      // 确认按钮颜色
      confirmButtonColor: '#3CC51F',
      // 是否展示取消
      showCancelButton: false,
      // 取消按钮文案
      cancelButtonText: '取消',
      // 取消按钮颜色
      cancelButtonColor: '#333'
    }, options);

    var ctx = pageCtx;
    if (!ctx) {
      var pages = getCurrentPages();
      ctx = pages[pages.length - 1];
    }
    var dialogCtx = ctx.selectComponent(parsedOptions.selector);

    if (!dialogCtx) {
      console.error('无法找到对应的dialog组件，请于页面中注册并在 wxml 中声明 dialog 自定义组件');
      return Promise.reject({
        type: 'component error'
      });
    }

    // 处理默认按钮的展示
    // 纵向排布确认按钮在上方
    var _parsedOptions$button = parsedOptions.buttons,
      buttons = _parsedOptions$button === undefined ? [] : _parsedOptions$button;

    var showCustomBtns = false;
    if (buttons.length === 0) {
      if (parsedOptions.showConfirmButton) {
        buttons.push({
          type: 'confirm',
          openType: parsedOptions.confirmOpenType || '',
          appParameter: parsedOptions.confirmAppParameter || parsedOptions.params || '',
          text: parsedOptions.confirmButtonText,
          color: parsedOptions.confirmButtonColor
        });
      }

      if (parsedOptions.showCancelButton) {
        var cancelButton = {
          type: 'cancel',
          text: parsedOptions.cancelButtonText,
          color: parsedOptions.cancelButtonColor
        };
        if (parsedOptions.buttonsShowVertical) {
          buttons.push(cancelButton);
        } else {
          buttons.unshift(cancelButton);
        }
      }
    } else {
      showCustomBtns = true;
    }

    if (buttons.length) {
      buttons.forEach(v => {
        
        if (v.type == 'confirm') {
          v.backgroundColors = ["#FF5B1F", "#F92C2C"];
          v.borderColor = "#FFF";
          v.color = "#FFF";
        }
        else {
          if (v.type == 'cancel') {
            v.backgroundColors = ['#FFF'];
            v.borderColor = "#E62922";
            v.color = "#E62922";
          }
        }

        if(v.icon) {
          v.icon = _.apply({
            size: 20,
            family:'sr-weapp',
          }, v.icon);
        }
      })
    }

    //Sunrise.event.fire('$showDialog');
    return new Promise(function (resolve, reject) {
      globalDialog = dialogCtx;
      dialogCtx.setData(Object.assign({}, parsedOptions, {
        buttons: buttons,
        showCustomBtns: showCustomBtns,
        key: '' + new Date().getTime(),
        show: true,
        promiseFunc: {
          resolve: resolve,
          reject: reject
        }
      }));
    });
  }

  return Dialog;

} 