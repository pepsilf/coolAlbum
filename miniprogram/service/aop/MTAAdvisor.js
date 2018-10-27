
module.exports = function (Sunrise) {

  class MTAAdvisor extends Sunrise.Advisor {

    pointcut = {
      after: {
        'pages/*/index': ['*Handler'],
        'sr-*': ['*Handler'],
      }
    }

    onAfter(returnValue, o, args) {
      console.log('MTAAdvisor',args[0],o);
      let e = args && args.length ? args[0] : undefined;
      if (e && e.currentTarget && e.currentTarget.dataset) {
        let d = e.currentTarget.dataset;
        if(d.eventId) {
          let eventQuery = d.eventQuery || returnValue;
          setTimeout(()=> {
            console.log('eventId,eventQuery', d.eventId, eventQuery);
            Sunrise.mta.stat(d.eventId, eventQuery);
          })
        }
      }
    }
  }

  return MTAAdvisor;

};

// "navigationStyle": "custom",


