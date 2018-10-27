import _ from './utils/attr.js';
import util from './utils/util.js';
import config from './config/index.js';

import weapp from './utils/weapp.js';
import sys from './utils/system-info.js';

import processor from './utils/processor/index.js';
import context from './utils/context/index.js';
import widget from './utils/widget/index.js';
import component from './utils/component/index.js';


import ObservableManager from './utils/observer/observable-manager.js';

import EventManager from './utils/event/event-manager.js';

import logger from './utils/logger.js';

export default {

  version: "3.0.0",

  user(v) {
    if (typeof v.install === 'function') {
      v.install.call(this, this);
    }
  },

  init: function(env) {



    /**
     * 安装观察者模式管理器
     */
    this.observableManager = new ObservableManager();

    /**
     * 
     * 事件管理器
     */
    this.event = new EventManager();

    /**
     * 安装框架基础组件
     */
    this.user(widget);

    /**
     * 安装框架处理器
     */
    this.user(processor);


    /**
     * 安装框架上下文
     */
    this.user(context);


    /**
     * 安装通用组件
     */
    this.user(component);


    /**
     * 小程序API 代理
     */
    this.weapp = weapp(this);


    return this;
  },




  run: function(env, args) {

    let _this = this;

    /**
     * 框架基础工具类
     */
    this._ = _;
    this.util = util;
    this.sys = sys(this);

    /**
     * 框架配置，合并项目配置
     */
    this.config = config(env);

    /**
     * 日志输入
     */
    this.logger = logger(this);

    let _isObject = _.isObject(args);
    let initFn = _.isFunction(args) ? args :
      _isObject && _.isFunction(args.init) ? args.init :
      new Function();

    if (_isObject) {
      delete args.init;
      _.applyIf(this.config, args);
    }

    App({

      onLaunch: function(options) {


        _this.logger.info('Sunrise 框架 开始加载... ...')

        _this.logger.info('当前机型：', _this.sys);

        this.sunrise = _this.init(env);

        /**
         * 埋点配置，默认使用peach
         */
        let mtaConfig = this.sunrise.config.mta
        mtaConfig = _.applyIf(mtaConfig || {}, {
          type: 'peach'
        })
        let entity = require('./utils/analytics/' + mtaConfig.type + '.js');
        this.sunrise.mta = entity(this.sunrise);

        /**
         * MTA 初始化
         */
        this.sunrise.mta.init(options);

        /**
         *  系统 初始化
         */
        initFn.call(this);

        /**
         * AOP 管理器加载
         */
        this.sunrise.advisorManager.run();

        //_this.weapp.init();
        _this.logger.info('Sunrise 框架 所有组件加载完成!! Sunrise->', _this)

      }
    })


  }

}