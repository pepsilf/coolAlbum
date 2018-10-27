

import _ from '../attr.js';
import _cache from '../cache.js';

module.exports = function(Sunrise) {

  const SEND_HASHMAP = {};

  const cache = _cache();

  const request = req => {

    if (req.options.isWait) {
      return req;
    }

    Sunrise.http2(req.options).then(res => {
      req.onFulfilled(res);
    }).catch(error => {
      
      if(error == 5000) {
        Sunrise.logger.error(`不能重复提交相同 ${req.options.ignore} 的请求`)
      }
      else {
        req.onRejected(error)
      }
    })

    return req;
  }

  const removeQueue = options => {

    let _requestQueue = SEND_HASHMAP[options.cacheKey || options.id];
    if (_.isArray(_requestQueue) && _requestQueue.length) {
      _requestQueue.shift();
      if (_requestQueue.length) {
        let req = _requestQueue[0];
        //let _isWait = req.options.isWait;
        req.options.isWait = false;
        req.start();
        //req.options.isWait = _isWait;
      }
    }
  }


  /**
   * 填充页面数据
   */
  Promise.prototype.fill = function(field,pageCtx) {
    let ctx = pageCtx ? pageCtx : Sunrise.util.getCurrentPage();
    return this.then(res => {
      if (field && res != undefined) {
        let data = {};
        if (_.isArray(field) && _.isArray(res) && field.length == res.length ) {
            for (let i = 0; i < field.length;i++) {
              data[field[i]] = res[i]
            }
        }
        else {
          data[field] = res
        }
        ctx.setData(data);
      }
      return res;
    })
  }

  class RequestHolder {

    constructor(options) {

      options = _.applyAll({
        method: "POST",
        contentType: 'json',
        isWait:false,
        isToastError:true,
        //noLogin: false
      }, options || {});

      let _sendId = options.cacheKey || options.id;
      if (_sendId) {
        let _requestQueue = SEND_HASHMAP[_sendId];
        if (!_requestQueue) {
          _requestQueue = [];
          SEND_HASHMAP[_sendId] = _requestQueue
        }
        _requestQueue.length && (options.isWait = true);
        _requestQueue.push(this);
      }
      
      if (options.removeCacheKey) {
        cache.removeItem(options.removeCacheKey);
      }

      if (options.removeStoreKey) {
        Sunrise.store.remove(options.removeStoreKey);
      }

      //console.log('_requestQueue', SEND_HASHMAP);
      //this._requestQueue = _requestQueue;
      this.options = options;
      this.promise = new Promise((resolve,reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    }

    onHandler(res) {
      this.resolve(res);
      removeQueue(this.options);
    }

    onFail(error) {
      this.reject(error);
      removeQueue(this.options);
    }

    /**
     * 成功处理
     */
    onFulfilled(res) {
      let options = this.options;
      if (_.isFunction(options.success)) {
        res = options.success(res);
      }

      /**
       * 缓存处理
       */
      if (options.storeKey) {
        Sunrise.store.set(options.storeKey, res);
      }
      else if (options.cacheKey) {
        cache.addItem(options.cacheKey, res);
      }

      this.onHandler(res);
      return this;
    }

    /**
     *  失败处理
     */
    onRejected(error) {
      if (this.options.isToastError) {
        wx.showToast({
          title: error.message || error.msg || '网络请求失败！',
          icon: 'none'
        })
      }
      this.onFail(error);
      return this;
    }

    send() {
      this.options.isWait = false;
      return this.start();
    }

    start() {
      let res = null;

      if (this.options.storeKey) {
        res = Sunrise.store.get(this.options.storeKey)
      }
      else if (this.options.cacheKey) {
        res = cache.getItem(this.options.cacheKey);
      }

      if (!res) {
        request(this);
      }
      else {
        this.onHandler(res);
      }
      return this.promise;
    }
  }


  return RequestHolder

}