

const Sunrise = getApp().sunrise;

let touchRenderer;

module.exports = Sunrise.Behavior({

  /**
   * 组件的属性列表
   */
  properties: {

    isOptions: {
      type: Boolean,
      value: false
    },

    item: Object
  },

  data: {
    _startTouchX: 0,
    _startTouchY: 0,
    _isTouch: false,
    _isDelected:false
  },

  methods: {
    
    _touchStartHandler: function (e) {

      if (e.touches.length == 1 && this.data.isOptions) {

        this._clearPreRenderer();
        this.setData({
          //记录触摸起始位置的X坐标
          _startTouchX: e.touches[0].clientX,
          _startTouchY: e.touches[0].clientY
        });
        touchRenderer = this;
      }
    },

    _touchMoveHandler: function (e) {

      if (e.touches.length == 1 && this.data.isOptions) {
        var moveX = e.touches[0].clientX;
        var moveY = e.touches[0].clientY;

        var disX = this.data._startTouchX - moveX;
        var disY = this.data._startTouchY - moveY;
        let _isTouch = false;

        if (Math.abs(disX) > 50 && Math.abs(disY) < 50) {
          _isTouch = disX > 0;
        }

        if (this.data._isTouch != _isTouch) {
          this.setData({ _isTouch });
        }
      }
    },

    _clearPreRenderer() {
      if (touchRenderer) {
        touchRenderer.setData({
          _isTouch: false,
          _isDelected:false,
        })
        touchRenderer = null;
      } 
    },


    removeDataHandler(e) {
      if (this.data.item) {
        if (this.data._isDelected) {
          this.setData({ _isTouch: false });
          this._clearPreRenderer();
          this.triggerEvent('delete', this.data.item);
        }
        else {
          this.setData({ _isDelected: true });
        }
      }

    }



  }

})