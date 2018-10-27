
const Sunrise = getApp().sunrise;

module.exports = Sunrise.Behavior({

  properties:{

    observerName : {
      type: String,
      observer: function (newVal, oldVal) {
        //this._addObserver(newVal, oldVal);
      }
    },
  },

  init() {

    if (!this.data.observerName)
      return;

    let observable = Sunrise.observableManager.get(this.data.observerName);
    observable.addObserver(this);
    //console.log('Behavior init observable');
  },

  destroy() {
    
    if (!this.data.observerName)
      return;

    let observable = Sunrise.observableManager.get(this.data.observerName);
    observable.deleteObserver(this);
    //console.log('Behavior destroy observable');
  },

  methods: {
    
  }

})