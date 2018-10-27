

module.exports = function(Sunrise) {


  const createPromise = options => {
    let req = new Sunrise.RequestHolder(options || {});
    return req.start();
  }


  const getPromises = options => {
    let promises = [];
    options.forEach(v => {
      if (v instanceof Promise) {
        promises.push(v);
      }
      else {
        promises.push(createPromise(v));
      }
    })
    return promises;
  }

  class AbstractService {

    constructor() {
      this.model = {};
      this._hasInitComplete = false;
    }

    create() { }

    init(options) {}

    hasComplete() {
      return this._hasInitComplete;
    }

    doComplete(model) {
      this._hasInitComplete = true;
      this.model = model || {};
    }

    doLoad(options) {
      if (!this._hasInitComplete) {
        let r = this.init(options);
        this._options = options;
        if (r instanceof Promise) {
          r.then(model => {
            this.doComplete(model);
          });
          return r;
        }
        else {
          this.doComplete();
        }
      }
    }

    reset() {
      this._hasInitComplete = false;
      this.doLoad(this._options);
    }

    post(options) {
      options.method = 'POST'
      return this.send(options);
    }

    get(options) {
      options.method = 'GET'
      return this.send(options);
    }



    resolve(res) {
      return Promise.resolve(res);
    }

    reject(error) {
      return Promise.reject(error);
    }

    sendAll(...options) {
      return Sunrise.weapp.doAuthorize().then(() => {
        return Promise.all(getPromises(options))
      });
    }

    sendRace(...options) {
      return Sunrise.weapp.doAuthorize().then(() => {
        return Promise.race(getPromises(options))
      });
    }

    send(options) {
      return Sunrise.weapp.doAuthorize(options.isCheckSession).then(()=>{
        return createPromise(options).catch(error => {
          /**
           * 
           * 如果登陆Token失效，再尝试一次登陆
           * 
           */
          if (error && error.errorCode === 500101 && !options.__isLogin__) { 
            options.__isLogin__ = true;
            Sunrise.weapp.doClear();
            return this.send(options);
          } else {
            return Promise.reject(error)
          }
        })
      });
    }
  }

  return AbstractService;

}