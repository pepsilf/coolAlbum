

import _ from '../attr.js';

import e from './event.js';

import cache from '../cache.js';

import util from '../util.js';

class EventManager {

  constructor() {
    this._cache = cache();


    /** 全局事件定义 */

    // this.FORM_FIELD_CHANGE = '::FormFieldChange';

    // this.WECHAT_AUTH = '::WechatAuth';


  }

  on(ctx, events) {
    events = events || ctx.events;
    if (events) {
      ctx._eventTarget = ctx._eventTarget || {};
      for (var t in events) {
        let method = events[t];
        if (_.isFunction(ctx[method]) && !e.hasEvent(ctx._eventTarget, t)) {
          e.on(ctx._eventTarget, t, ctx[method], ctx);
        }
      }
      ctx.__eventKey__ = ctx.__eventKey__ || util.generateUUID();
      this._cache.addItem(ctx.__eventKey__, ctx);
    }
  }

  fire(type, args) {
    let all = this._cache.items();
    for(let key in all) {
      let ctx = all[key];
      ctx._eventTarget && e.fireEvent(ctx._eventTarget, type, args);
    }
  }

  firePre(type,args) {
    let prePage = util.getPrePage();
    if(prePage) {
      let all = [prePage].concat(prePage._Components);
      all.forEach(ctx => {
        ctx._eventTarget && e.fireEvent(ctx._eventTarget, type, args);
      })
    }
  }

  un(ctx) {

    if (ctx.__eventKey__ && ctx.events && ctx._eventTarget) {
      for (var t in ctx.events) {
        let method = ctx.events[t];
        if (_.isFunction(ctx[method])) {
          e.delEvent(ctx._eventTarget, t, ctx[method], ctx);
        }
      }
      this._cache.removeItem(ctx.__eventKey__);
      let all = this._cache.items();
      console.log('all', all);
    }
  }


}

module.exports = EventManager;