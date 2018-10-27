

import _ from '../attr.js';

class Observable {
  constructor() {
    this.changed = false;
    this.obs = [];
  }

  addObserver(o) {
    if(o && _.isFunction(o.doUpdate)) {
      let index = this.obs.indexOf(o);
      index == -1 && this.obs.push(o);
    }
    return this;
  }

  deleteObserver(o) {
     let index = this.obs.indexOf(o);
     index != -1 && this.obs.splice(index,1);
  }

  notifyObservers(org) {
      this.obs.forEach( o => {
        o.doUpdate(org);
      })
  }

  count() {
    return this.obs.length;
  }
}

module.exports = Observable;