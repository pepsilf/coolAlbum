'use strict';

const Sunrise = getApp().sunrise

Sunrise.Component({

  properties: {
    show: {
      type: Boolean,
      value: false,
      observer: function (val) {
        this._showpropertiesChange(val);
        //Sunrise.event.fire('$pop-show', [val, Sunrise.util.getCurrentPage()])
      }
    },
    // 是否有遮罩层
    overlay: {
      type: Boolean,
      value: true
    },
    // 遮罩层是否会显示
    showOverlay: {
      type: Boolean,
      value: true
    },

    top: {
      type: String,
      value: '0'
    },
    // 内容从哪个方向出，可选 center top bottom left right
    type: {
      type: String,
      value: 'center'
    }
  },

  methods: {

    init() {
      this._showpropertiesChange(this.data.show)
    },

    _showpropertiesChange(newVal) {
      this.hasComplete && Sunrise.event.fire('$pop-show', [newVal, Sunrise.util.getCurrentPage()])
    },

    handleMaskClick: function handleMaskClick() {
      this.triggerEvent('clickmask', {});
    }
  }
});