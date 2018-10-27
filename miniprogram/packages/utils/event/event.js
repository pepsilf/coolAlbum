
import _ from '../attr.js';

let eventBusCount = 0;
module.exports = {

  /**
   * 添加事件
   */
  on: function (_eventTarget, type, listener, scope, priority) {

    let handlers = _eventTarget[type];

    if (!listener.__eventID__)
      listener.__eventID__ = eventBusCount++;

    if (!handlers) {
      handlers = _eventTarget[type] = {};
    }

    handlers[listener.__eventID__] = {
      handler: listener,
      scope: scope,
      priority: priority
    };
  },

  /**
   * 触发事件
   */
  fireEvent: function (_eventTarget,type, args) {

    let fns = _eventTarget[type];
    let handlers = [],
      h;
    for (let i in fns) {
      handlers.push(fns[i]);
    }

    handlers = handlers.sort(
      function (a, b) {
        if (a.priority && b.priority) {
          if (a.priority > b.priority) return -1;
          if (a.priority < b.priority) return 1;
        }
        return 1;
      }
    );

    if (handlers.length) {

      let pages = getCurrentPages();
      let ctx = pages[pages.length - 1];

      handlers.forEach(v => {
        v.handler.apply((v.scope || ctx), args);
      });

    }

  },

  /**
   * 是否存在事件
   */
  hasEvent: function (_eventTarget, type) {
    return !_.isEmptyObject(_eventTarget[type]);
  },

  /**
   * 移除事件
   */
  delEvent: function (_eventTarget,type, listener) {
    if (_eventTarget[type]) {
      if (listener && listener.__eventID__)
        delete _eventTarget[type][listener.__eventID__];
      else
        delete _eventTarget[type];
    }
  }
}