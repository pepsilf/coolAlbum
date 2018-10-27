

module.exports = function (Sunrise) {

  var sys = wx.getSystemInfoSync();
  var device = sys.model.indexOf('iPhone X') != -1 ? 'iPhoneX' : sys.model;

  sys.device = device;
  sys.isTooler = sys.brand == 'devtools';
  

  return sys;

}