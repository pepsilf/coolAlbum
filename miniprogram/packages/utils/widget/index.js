import http from './http.js';

import http2 from './http2.js';
import store from './store.js';
import peach from './peach.js';

export default {

  install(Sunrise) {

    this.http = http(this);

    this.http2 = http2(this);

    this.store = store(this);

    this.peach = peach(this);

  },

  
}