

import _ from '../attr.js';
import cache from '../cache.js';

//requirePath
const SERVER_PATH = '../../../service';
const ROOT_PATH = '../../../packages';
const PAGES_PATH = '../../../pages';
const ROOT_SER_PATH = '../../../packages/utils/server';

const DEF_SER_NAME = 'service.js';

const IS_SEV_REGX = /(?:Service$)/gi;

module.exports = function (Sunrise) {

  function getPath(o) {
    const name = o.name.replace(/(?:\.)/gi, '/');
    const ps = /(?:Service$)/gi.test(name) ? [name] : [name, DEF_SER_NAME];
    const paths =
      o.prefix == '$$' ? [ROOT_SER_PATH]:
        o.prefix == '$' ? [ROOT_PATH] :
          o.prefix == '@' ? [PAGES_PATH] : 
                            [SERVER_PATH];

    return paths.concat(ps).join('/');
  }

  function getBeanHolder(s) {

    let name = s;
    let prefix = '';
    let varPrefix = '';

    if (s.startsWith('$$')) {
      name = s.substring(2);
      varPrefix = prefix = '$$';
    }
    else {
      if (s.startsWith('$')) {
        name = s.substring(1);
        varPrefix = prefix = '$';
      }
      else {
        if (s.startsWith('@')) {
          name = s.substring(1);
          prefix = '@';
        }
      }
    }

    let lastIndex = name.lastIndexOf('.');
    let beanId = getAlias(lastIndex == -1 ? name : name.substring(lastIndex + 1));
    return {
      beanId: varPrefix + beanId,
      name,
      prefix
    }
  }

  const doNamespace = (o, bean) => {
    let holder = bean.holder;
    let name = holder.name;

    let sls = name.split('.');
    if (sls.length >= 2) {
      for (var i = 0; i < sls.length - 1; i++) {
        let n = sls[i].replace(/\@/gi,'')
        let f = getAlias(n);
        o[f] = o[f] || {}
        o = o[f]
      }
    }
    o[holder.beanId] = bean.server;

    return bean.server;
  }

  const getAlias = str => {
    let lastIndex = str.lastIndexOf('/');
    if (lastIndex != -1) {
      return getAlias(str.substring(lastIndex + 1).replace('.js', ''));
    }
    else {
      let sls = str.split(/\-|\_|\./);
      sls.forEach((v, i) => {
        if (v) {
          sls[i] = v.charAt(0).toUpperCase() + v.substring(1);
        }
      })
      let propertyName = sls.join('');
      propertyName = propertyName.replace(/(?:Service$)/gi,
        function (f) {
          return "";
        });
      return propertyName.charAt(0).toLowerCase() + propertyName.substring(1);
    }
  }


  const _beanFactroy = cache();
  const _pageFactroy = cache();

  const getBean = (v) => {

    let server;

    const holder = getBeanHolder(v);
    const beanPath = getPath(holder);

    if (holder.name && beanPath) {
      let _beanServer = _beanFactroy.getItem(holder.name);
      if (!_beanServer) {
        const _beanClass = require(beanPath);
        _beanServer = new _beanClass();
        _beanFactroy.addItem(holder.name, _beanServer);
        _.isFunction(_beanServer.create) && _beanServer.create();

        Sunrise.advisorManager.addAdvisors(v, _beanServer, _beanClass)

        Sunrise.event.on(_beanServer);

      }
      server = _beanServer;
    }

    !server && console.warn(`没有查找到BeanId为：${v}的Server类`);

    return {
      server,
      holder
    }
  }


  // const getPageRoute = route => {
  //   let index = route.indexOf('?');
  //   let key = index == -1 ? route : route.substring(0, index);
  //   return key.startsWith("/") ? key.substring(1) : key;
  // }


  class Context {

    constructor() {
    }

    // addPage(pageCtx) {
    //   //console.log('pageCtx', pageCtx);
    //   let key = getPageRoute(pageCtx.route);
    //   //_pageFactroy.removeItem(key);
    //   _pageFactroy.addItem(key, pageCtx);
    // }

    // removePage(pageCtx) {
    //   //console.log('removePage,pageCtx', pageCtx);
    //   let key = getPageRoute(pageCtx.route);
    //   _pageFactroy.removeItem(key);
    // }

    getPage(id) {
      return _pageFactroy.getItem(id);
    }

    getBean(id) {
      return getBean(id).server;
    }

    injectClass(o) {
      const services = o.services || [];
      const injectQueue = [];
      let service = {};
      services.forEach(v => {
        injectQueue.push(doNamespace(service, getBean(v)));
      });
      return { injectQueue, service };
    }

  }

  return new Context();
}