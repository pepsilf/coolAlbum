import _ from '../attr.js';
import cache from '../cache.js';
import util from '../util.js';
import _extends from './extends.js';

const hasOwn = Object.prototype.hasOwnProperty;

const getName = name => {
  //debugger
  return 'sr-' + name;
}

const onStart = (o, viewType, _holder, Sunrise) => {

  const _service = _holder.service;
  const _injectQueue = _holder.injectQueue;
  const _events = o.events;
  const _name = o.name ? getName(o.name) : null;

  // const ps = Sunrise.weapp.init();
  // if (ps instanceof Promise) {
  //   promiseLike.push(ps)
  // }
  // o._Components = [];
  // o._Behaviors = [] behaviors: [Observer];

  switch (viewType) {

    case 'Behavior':
      {
        break;
      }
    case 'Component':
      {


        //Sunrise.advisorManager.addAdvisors(_name, o.methods);

        const _mixinsChain = returnInitAndDestroy(o, false);
        const mixins = o.mixins || [];
        const behaviors = [];
        mixins.forEach(v => {
          behaviors.push(Behavior(v));
        })
        o.behaviors = behaviors;

        //Sunrise.advisorManager.addAdvisors(_name, o.methods);
        //console.log('o.behaviors', o.behaviors);
        o.ready = function() {

          
          this._mixinsChain = _mixinsChain;

          /**
           * 业务服务对象
           */
          this.service = _service;
          

          /**
           * 事件绑定对象
           */
          this.events = _events;


          /**
           * 组件的命名
           */
          this.name = _name;
          
          /**
           * 将页面组件添加到当前页面中的_Components数组中管理
           */
          let pageCtx = Sunrise.util.getCurrentPage();
          if (pageCtx && pageCtx._Components) {
            this.uuid = pageCtx.uuid;
            pageCtx._Components.push(this);
          }

          /**
           * AOP 拦截
           */
          //Sunrise.advisorManager.setTarget(this.name,this);
          Sunrise.advisorManager.addAdvisors(this.name, this);
          /**
           * Component 事件注册
           */
          Sunrise.event.on(this);

          
          /**
           * 微信服务初始化及相关数据加载
           */
          Sunrise.weapp.init().then(() => {
            _doInjectQueue.call(this, _injectQueue, pageCtx._pageOptions, Sunrise).then(res => {
              //Sunrise.logger.debug(`页面Page 所有组件 初始化执行 init 页面参数：`)
              this.hasComplete = true;
              _doInitSyncChain.call(this, pageCtx._pageOptions);
            })
          })
        }
        break;
      }
    case 'Page':
      {

        // 默认加上onReachBottom方法，不然微信不会触发组件的分页
        if (!o.onReachBottom) { 
          o.onReachBottom = function () { }
        }

        o.onLoad = function(options) {


          Sunrise.logger.debug(`页面Page ${this.route} 加载完成`)
          

          this.uuid = Sunrise.util.generateUUID();
          this.service = _service;
          this._pageOptions = options;


          /**
           * 页面埋点
           */
          Sunrise.mta.pageInit();

          /**
           * AOP 拦截
           */
          //let route = getPageKey(this.route);
          //console.log('route', route);
          Sunrise.advisorManager.addAdvisors(getPageKey(this.route), this);


          /**
           * Page 事件注册
           */
          Sunrise.event.on(this, _events);


          /**
           * 微信服务初始化及相关数据加载
           */
          Sunrise.weapp.init().then(() => {
            _doInjectQueue.call(this, _injectQueue, options, Sunrise).then(res => {
              Sunrise.logger.debug(`页面Page ${this.route} 初始化执行 init 页面参数：`,options)
              this.hasComplete = true;
              _doInitChain.call(this, options);
            })
          })


        }

        o.onUnload = function() {
          /**
           * 清除 AOP 拦截
           */
          Sunrise.advisorManager.removeAdvisors(getPageKey(this.route));


          /**
           * Page 事件注销
           */
          Sunrise.event.un(this);


          /**
           * Page 组件的AOP及事件销毁
           */
          this._Components.forEach(v => {
            Sunrise.advisorManager.removeAdvisors(v.name);
            Sunrise.event.un(v);
            _doDestroyChain.call(v);
            v.hasComplete = false;
          })
          this._Components = [];
          _doDestroyChain.call(this);
          Sunrise.logger.debug(`页面Page ${this.route} 销毁执行 destroy `)
          this.hasComplete = false;
        }

        //entry
        o.onShow = function() {
          _doOnShowChain.call(this,this._mixinsChain.onShows.length)
        }

        break;
      }
  }

  return o;
}


const getPageKey = route => {
  let index = route.indexOf('?');
  let key = index == -1 ? route : route.substring(0, index);
  return key.startsWith("/") ? key.substring(1) : key;
}


/**
 * 按加载顺序，初始化继承对象
 */
const returnInitAndDestroy = (o, isExtend) => {

  const inits = [];
  const onShows = [];
  const destroys = [];
  const mixins = o.mixins || [];
  mixins.forEach(v => {
    if (_.isFunction(v.init)) {
      inits.push(v.init);
    }
    if (_.isFunction(v._onShow)) {
      onShows.push(v._onShow);
    }
    if (_.isFunction(v.destroy)) {
      destroys.push(v.destroy);
    }
    isExtend && _extends(o, v);
  });
  return {
    inits,
    destroys,
    onShows
  };
}

/*
  1、处理队列
*/
const _doInjectQueue = function (_injectQueue, options, Sunrise) {

  const promiseLike = [];

  _injectQueue.forEach(server => {
    if (server instanceof Sunrise.Service) {
      let res = server.doLoad(options);
      res && promiseLike.push(res);
    }
  });

  return promiseLike.length ? Promise.all(promiseLike) : Promise.resolve();
  //debugger
  // return p.then(res => {

  //   debugger
  //   console.log(res);
  // });

}



const _doInitComplete = function(res) {
  if (_.isFunction(this.init)) {
    this.init(res);
  }
}

const _doInitSyncChain = function(res) {
  if (this._mixinsChain.inits.length) {
    this._mixinsChain.inits.forEach(fn => {
      fn.call(this);
    })
  }
  _doInitComplete.call(this, res);
}

const _doOnShowChain = function(index, res) {
  if (index >= 1) {
    this._processorOnShow = this._mixinsChain.onShows[index - 1]
    this._processorOnShow.call(this, _res => {
      _doOnShowChain.call(this, index - 1, res);
    }, res);
  } else if (_.isFunction(this._pageOnShow)) {
    this._pageOnShow();
  }
}

const _doInitChain = function(res) {

  if (this._mixinsChain.inits.length) {
    this._processorInit = this._mixinsChain.inits.shift();
    this._processorInit.call(this, _res => {
      _doInitChain.call(this, res);
    }, res);
  } else {
    _doInitComplete.call(this, res);
  }
}

const _doDestroyChain = function() {

  if (this._mixinsChain.destroys.length) {
    this._mixinsChain.destroys.forEach(fn => {
      fn.call(this);
    })
  }

  if (_.isFunction(this.destroy)) {
    this.destroy();
  }
}

const _next = function(res) {

  if (this._queues.length) {

    this._processor = this._queues.shift();
    this._processor.init.call(this, _res => {
      this._next.call(this, res);
    });
  } else {

    initBean.call(this)
    initComplete.call(this, res);

    delete this._processor;
    delete this._queues;
  }
}


const Create = (Sunrise, viewType) => {

  return function(o) {

    let isComponent = viewType == 'Component';
    let isBehavior = viewType == 'Behavior';
    let isExtend = viewType == 'Page';

    if (typeof o == 'object') {

      //o.mixins || o.behaviors || []
      const _mixinsChain = returnInitAndDestroy(o, isExtend);
      const _holder = Sunrise.context.injectClass(o);

      o._mixinsChain = _mixinsChain;
      // o._doInitChain = _doInitChain;
      // o._doDestroyChain = _doDestroyChain;
      // o._doOnShowChain = _doOnShowChain;

      o._pageOnShow = o.onShow;
      o._Components = [];

      //o.name && console.log('name start', o.name);

      onStart(o, viewType, _holder, Sunrise);

      //console.log(`Sunrise-Bean-${viewType}`, _service);
    }



    return isBehavior  ? o :
           isComponent ? Component(o) : Page(o);
  };
}



module.exports = function(Sunrise, isComponent) {
  return Create(Sunrise, isComponent);
}