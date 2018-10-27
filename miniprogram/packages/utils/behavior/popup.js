
const Sunrise = getApp().sunrise;

module.exports = Sunrise.Behavior({
  
  /**
   *  组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal) {
        this._showPropertiesChange(newVal, oldVal);
      }
    },

    overlay: {
      type: Boolean,
      value: true
    },

    closeOnClickOverlay: {
      type: Boolean,
      value: true
    },
  

    // 弹出方向
    type: {
      type: String,
      value: 'center'
    },

    selector: String,
  },


  /**
   *  组件的初始数据
   */
  data: {
  },


  /**
   *  组件的方法列表
   */
  methods: {

    handleMaskClick: function handleMaskClick() {
      this.triggerEvent('click-overlay', {});
      if (!this.data.closeOnClickOverlay) {
        return;
      }
      this.setData({
        show: false
      });
      this.triggerEvent('close', {});
    },

    _showPropertiesChange(newVal, oldVal) {

    }

  }


});