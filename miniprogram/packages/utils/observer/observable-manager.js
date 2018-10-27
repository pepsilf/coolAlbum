

import _ from '../attr.js';
import cache from '../cache.js';
import Observable from './observable.js';

class ObservableManager {
  constructor() {
    this._cache = cache();
  }

  set(id, observable) {
    if (observable instanceof Observable) {
      this._cache.addItem(id, observable);
    }
    return this;
  }

  get(id) {
    let observable = this._cache.getItem(id);
    if (!observable) {
      observable = new Observable();
      this.set(id, observable);
    }
    return observable;
  }

  notify(id,args) {
    if(id) {
      let observable = this.get(id);
      observable.notifyObservers(args);
    }
  }

}

module.exports = ObservableManager;