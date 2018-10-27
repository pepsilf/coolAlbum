
const Sunrise = getApp().sunrise;

module.exports = {

  init(next) {

    next();

    if (!this.data.observerName)
      return;
      
    let observable = Sunrise.observableManager.get(this.data.observerName);
    observable.addObserver(this);
    //console.log('Page init observable');
  },

  destroy() {

    if (!this.data.observerName)
      return;

    let observable = Sunrise.observableManager.get(this.data.observerName);
    observable.deleteObserver(this);
    //console.log('Page destroy observable');
  },

};