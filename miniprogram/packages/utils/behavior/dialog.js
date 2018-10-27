
const Sunrise = getApp().sunrise;

const defaultData = {
  // 标题
  title: '',
  // 自定义 btn 列表
  // { type: 按钮类型，回调时以此作为区分依据，text: 按钮文案, color: 按钮文字颜色 }
  buttons: [],
  // 内容
  message: '',
  // 选择节点
  selector: '#sr-dialog',
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
}

module.exports = Sunrise.Behavior({
  
  /**
   *  组件的属性列表
   */
  properties: {},

  /**
   *  组件的初始数据
   */
  data: Sunrise._.apply({
    key: '',
    show: false,
    showCustomBtns: false,
    promiseFunc: {}
  }, defaultData),

  /**
   *  组件的方法列表
   */
  methods: {

    /**
     * 隐藏
     */
    hide(params) {
      if(this.data.show) {
        this.setData({
          show: false
        });
        //Sunrise.event.fire('$hideDialog');
        this.triggerEvent('close', params);
      }
    },

    // 处理按钮的binderror事件
    handlerOnError(e) {
      if (e.currentTarget.dataset.type == 'confirm') {
        if (this.data.confirmBindError) {
          this.data.confirmBindError(e)
        }
      } else if (e.currentTarget.dataset.type == 'cancel') {
        if (this.data.cancelBindError) {
          this.data.cancelBindError(e)
        }
      }
    },

    /**
     * 处理按钮点击事件
     */
    handlerButtonClick: function handleButtonClick(e) {
      var _e$currentTarget = e.currentTarget,
        currentTarget = _e$currentTarget === undefined ? {} : _e$currentTarget;
      var _currentTarget$datase = currentTarget.dataset,
        dataset = _currentTarget$datase === undefined ? {} : _currentTarget$datase;

      // 获取当次弹出框的信息
      var _ref = this.data.promiseFunc || {},
        _ref$resolve = _ref.resolve,
        resolve = _ref$resolve === undefined ? _f : _ref$resolve,
        _ref$reject = _ref.reject,
        reject = _ref$reject === undefined ? _f : _ref$reject;

        var item = dataset.item || {};
        var params = item.params || item.appParameter;

        // 自定义按钮，全部 resolve 形式返回，根据 type 区分点击按钮
        if (this.data.showCustomBtns) {
            resolve({ type: item.type, params });
            return;
        }

        // 默认按钮，确认为 resolve，取消为 reject
        if (dataset.type === 'confirm') {
            resolve({ type: 'confirm', params });
        } else {
            reject({ type: 'cancel', params });
        }

        // 重置展示
        this.hide();
    }

  }


});