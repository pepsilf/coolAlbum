
module.exports = function (Sunrise) {

  class MTAAdvisor extends Sunrise.Advisor {

    pointcut = {
      before: {
        '*Service': ['get*'],
      }
    }

    onBefore(o, args) {
      console.log('MyAdvisor',args);
    }
  }

  return MTAAdvisor;

};


