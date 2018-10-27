
const http = function(Sunrise) {

  const _ = Sunrise._;
  const IGNORE_MAP = {};
  const LOCK_MAP = {};
  const CONTENT_TYPE_MAP = {
    'json':'application/json',
    'form': 'application/x-www-form-urlencoded',
  }

  const clear = function(options) {
    setTimeout(()=> {
      if (_.isString(options.ignore)) {
        delete IGNORE_MAP[options.ignore];
      }

      if (_.isString(options.lock)) {
        delete LOCK_MAP[options.lock];
      }
    },150)
  }

  const printLog = function (m, options,result) {
    Sunrise.logger[m]('\n配置:', options, '\n地址:', options.url, '\n入参:', options.data, '\n结果:',result)
  }
 

  const create = function (options,header) {
    options.loading && wx.showLoading({});
    options.data = _.result(options, 'data');
    //!options.lock && (options.lock = Sunrise.util.generateUUID());

    return new Promise((resolve, reject) => {
      wx.request({
        url: options.url,
        method: options.method,
        data: options.data,
        header: header,
        complete: (res) => {
          options.loading && wx.hideLoading();
          if (res.statusCode === 200 && !res.data.errorCode) {
            resolve(res.data.data);
            printLog('iao',options, res.data);
          }
          else {
            reject(res.data)
            printLog('error',options, res.data);
          }
          clear(options);
        }
        // fail: (error) => {
        //   options.loading && wx.hideLoading();
        //   reject(error)
        //   clear(options);
        // }
      })
    }); 
    //return LOCK_MAP[options.lock];
  }

  const doAction = function (options) {

    if (_.isString(options.ignore)) {
      IGNORE_MAP[options.ignore] = options;
    }

    if (!options.url.startsWith('http')) {
      options.url = Sunrise.config.baseApi + (options.basePath || Sunrise.config.basePath) + options.url;
    }

    let header = {
      'content-type': CONTENT_TYPE_MAP[options.contentType.toLowerCase()],
      'osType': 'xapp',
      'hn-app-id': Sunrise.config.serviceName || ''
    }

    if (Sunrise.weapp.accessToken) {
      header['access-token'] = Sunrise.weapp.accessToken
    }

    //return create(options, header);
    return _.isString(options.lock) ? (LOCK_MAP[options.lock] = create(options, header), LOCK_MAP[options.lock]) 
                                    : create(options, header);
  }

  const send = function(options) {

    options = _.apply({
      method:'POST',
      loading:false,
      contentType: 'json',
    }, options || {})

    if (_.isEmpty(options.url)) {
      throw new Error('http url is not empty.');
    }

    if (_.isString(options.ignore) && IGNORE_MAP[options.ignore]) {
      return Promise.reject(5000);
    }

    if (_.isString(options.lock) && LOCK_MAP[options.lock] instanceof Promise) {
      return LOCK_MAP[options.lock];
    }
    return doAction(options); 

  }
  
  return send
}
export default http