
import request_holder from './request-holder.js';

import abstract_service from './abstract-service.js';

import wechat_service from './wechat-service.js';

export default {

  install(Sunrise) {

    this.RequestHolder = request_holder(this);

    this.Service = abstract_service(this);

    this.Wechat = wechat_service(this);
    
  },

  
}