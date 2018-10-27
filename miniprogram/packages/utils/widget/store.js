import dateUtil from '../date.js';

module.exports = function(Sunrise) {

  // const strIntervals = ['s', 'n', 'h', 'd', 'w', 'q', 'm', 'y'];
  // function getExpiresTime(expires,date) {
  //   let len = expires.length;
  //   if (len > 1) {
  //     for(var i=1; i<len;i++) {
  //       var v = expires.charAt(i).toLowerCase();
  //       var index = strIntervals.indexOf(v);
  //       if(index != -1) {
  //         var n = expires.substring(0,i);
  //         var s = strIntervals[index];
  //         date = dateUtil.toUp(date || new Date(),s,Number(n));
  //         let _expires = expires.substring(i+1);
  //         if (_expires) {
  //           return getExpiresTime(_expires, date);
  //         }
  //       }
  //     }
  //   }
  //   return date;
  // }



  return function () {

    return {

      set: function (k, v, expires) {

        var now = dateUtil.toFormat(new Date());
        var val = {
          updateTime:now,
          data:v
        }

        if (typeof expires === 'string') {
          var _expiresTime = dateUtil.getUpTime(expires);
          if (_expiresTime) {
            val['expiresTime'] = dateUtil.toFormat(_expiresTime);
          }
        }
        wx.setStorageSync(k, JSON.stringify(val));
        return v;
      },

      has: function(k) {
        return !!wx.getStorageSync(k);
      },

      remove: function (k) {
        wx.removeStorageSync(k)
      },

      get: function (k) {
        let v = wx.getStorageSync(k);
        if(v) {
          let content = JSON.parse(v);
          if (content.expiresTime) {
            let _expiresTime = dateUtil.toDate(content.expiresTime).getTime();
            let _nowTime = new Date().getTime();
            if (_nowTime > _expiresTime) {
              delete content.data;
              wx.removeStorageSync(k)
              return;
            }
          }
          return content.data;
        }
      }
    }
  }()

}