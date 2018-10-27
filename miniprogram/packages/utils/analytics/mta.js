module.exports = function(Sunrise) {
    
    class Mta {

        constructor() {
          if (Sunrise.config.env == 'prod' && Sunrise.config.mta) {
            this.mta = require("../../../mta/mta_analysis.js");
          }
        }

        init(options) {
          if(!this.mta) return;

          var config = Sunrise._.apply({
            lauchOpts: options
          }, Sunrise.config.mta || {})
          this.mta.App.init(config);
        }

        stat() {
          if (!this.mta) return;
          this.mta.Event.stat.apply(this.mta.Event,arguments);
        }

        pageInit() {
          if (!this.mta) return;
          this.mta.Page.init();
        }
    }

  return new Mta();
}