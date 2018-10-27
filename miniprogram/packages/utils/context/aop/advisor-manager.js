

import _ from '../../attr.js';
import cache from '../../cache.js';


module.exports = function(Sunrise) {

  const BEFORE = 'before';
  const AFTER = 'after';
  const AROUND = 'around';

  const _AdvisorFactroy = cache();
  const _AOP_MAP = {};

  const _doPointcut = (t,r,i) => {
    if (r.pointcut) {
      let p = r.pointcut[t];
      if (p) {
        for(var f in p) {
          let k = f;
          let _as = _AdvisorFactroy.getItem(k);
          if (!_.isArray(_as)) {
            _as = [new AOPHolder(r, t, p[f])]
            _AdvisorFactroy.addItem(k, _as);
          }
          else {
            _as.push(new AOPHolder(r, t, p[f]));
          }
        }
      }
    }
  }


  const hasAdvisor = (pattern,name) => {

    if (pattern.indexOf('*') == -1) {
      return pattern == name;
    }
    else {
      let reg = new RegExp(pattern.replace('*', '[@/a-zA-Z0-9_-]*'), "g");
      //console.log('_AdvisorFactroy', reg);
      return reg.test(name);
    }
  }


  const hasMethodAdvisor = (patterns,method) => {
    if (_.isArray(patterns)) {
      for (var i = 0; i < patterns.length;i++) {
        let p = patterns[i];
        if (hasAdvisor(p,method)) {
          return true;
        }
      }
    }
    return false;
  }

  
  const getDefaultMethodAdvisor = (d,o,fn,m) => {

    return function() {

      //let o =  d.target;

      var args = Array.prototype.slice.call(arguments);

      if (d.__aroundHolders.length) {
        let aroundHolder = d.__aroundHolders[0];
        if (hasMethodAdvisor(aroundHolder.patterns, m)) {
          return aroundHolder.advisor.onAround(fn, o, args)
        }
      }

      if (d.__beforeHolders.length) {
        d.__beforeHolders.forEach(h => {
          if (hasMethodAdvisor(h.patterns, m)) {
            h.advisor.onBefore(o, args)
          }
        })
      }

      let returnValue = fn.apply(o, arguments);
      if (d.__afterHolders.length) {
        d.__afterHolders.forEach(h => {
          if (hasMethodAdvisor(h.patterns, m)) {
            h.advisor.onAfter(returnValue, o, args);
          }
        })
      }
      return returnValue;
    }
  }

  class AOPHolder {

    constructor(advisor, type, patterns) {
      this.advisor = advisor;
      this.patterns = patterns;
      this.type = type;
    }
  }


  class DefaultPointcutAdvisor {

    constructor(t,c){

      //this.targetMap = {};

      this.target = t;
      this.clazz = c;
      this.__beforeHolders = [];
      this.__afterHolders = [];
      this.__aroundHolders = [];
      this.init();
    }

    // setTarget(t) {
    //   this.target = t;
    //   // if (t.__wxExparserNodeId__) {
    //   //   this.targetMap[t.__wxExparserNodeId__] = t;
    //   // }
    //   //console.log('setTarget', t);
    //   // console.log('__wxExparserNodeId__', t.__wxExparserNodeId__);
    //   this.init();
    // }

    init(t) {
      t = t || this.target;
      let keys = (function (clazz,target) { 
        if (clazz) {
          return Object.getOwnPropertyNames(clazz.prototype);
        }
        let ks = [];
        for (var f in target) {
          ks.push(f);
        }
        return ks;
      })(this.clazz,t) 
      //console.log('ownKeys',keys,t);
      keys.forEach(m => {
        let fn = t[m];
        if (_.isFunction(fn)) {
          t[m] = getDefaultMethodAdvisor(this,t, fn, m)
        }
      })

    }

    addHolder(a) {
      if(_.isArray(a)) {
        a.forEach(s => {
          if (s.type == BEFORE) {
            this.__beforeHolders = this.__beforeHolders.concat(a);
          }
          else if (s.type == AFTER) {
            this.__afterHolders = this.__afterHolders.concat(a);
          }
          else if (s.type == AROUND) {
            this.__aroundHolders = this.__aroundHolders.concat(a);
          }
        })
      }
    }


    detroy() {
      this.target = null;
      this.__holders = this._before = this._after = this._around = null;
    }

  }


  class AdvisorManager {

    run() {
      let pointcuts = Sunrise.config.pointcuts;
      if (_.isArray(pointcuts)) {
        pointcuts.forEach(v => {
          let path = ['../../../../'].concat(v).join('');
          let Advisor = require(path)(Sunrise);
          let r = new Advisor();
          if (r.pointcut && r instanceof Sunrise.Advisor) {
            _doPointcut(BEFORE, r);
            _doPointcut(AFTER, r);
            _doPointcut(AROUND, r);
          }
        })       
      }
      return this;
    }
    //add
    // setTarget(k,t) {
    //   if(k) {
    //     let defaultPointcutAdvisor = _AOP_MAP[k];
    //     if (defaultPointcutAdvisor) {
    //       defaultPointcutAdvisor.setTarget(t)
    //     }
    //   }
    //   return this;
    // }

    addAdvisors(k,t,c) {
      if(k && t) {
        let all = _AdvisorFactroy.items();
        for(var f in all) {
          let has = hasAdvisor(f,k);
          if(has) {
            let defaultPointcutAdvisor = _AOP_MAP[k];
            if (!defaultPointcutAdvisor) {
              defaultPointcutAdvisor = new DefaultPointcutAdvisor(t,c);
              _AOP_MAP[k] = defaultPointcutAdvisor;
            }
            //console.log('defaultPointcutAdvisor', f, defaultPointcutAdvisor);
            defaultPointcutAdvisor.addHolder(all[f]);
          }
        }
      }
      return this;
    }

    removeAdvisors(k) {
      let defaultPointcutAdvisor = _AOP_MAP[k];
      if (defaultPointcutAdvisor) {
        defaultPointcutAdvisor.detroy();
        defaultPointcutAdvisor = null;
        delete _AOP_MAP[k];
      }
      return this;
    }


  }

  return new AdvisorManager();
};