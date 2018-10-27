


import e from './event/event.js';
//on,fire,has
let _eventTarget = {};
let event = {

  /**
   * 添加事件
   */
  addEvent: function (type, listener, scope, priority) {
    e.on(_eventTarget, type, listener, scope, priority);
  },

  /**
   * 触发事件
   */
  triggerEvent: function (type, args) {
    e.fireEvent(_eventTarget, type, args);
  },

  /**
   * 移除事件
   */
  removeEvent: function (type, listener) {
    e.delEvent(_eventTarget, type, listener);
  }
}

module.exports = event