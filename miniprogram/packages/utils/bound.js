


module.exports = {

  stageToMiddle: function (page, field, child, parentWidth, parentHeight) {
    
    var childQuery = wx.createSelectorQuery().in(page).select(child);
    childQuery.boundingClientRect(function (childRect) {

      let middleLocaltion = {};

      let childWidth = childRect.width;
      let childHeight = childRect.height;

      //let maxHeight = parentHeight * 0.8;

      let left = (parentWidth - childWidth) * 0.5;
      let top = (parentHeight - childHeight) * 0.5;
      middleLocaltion[field] = {
        top: top,
        left: left
      }
      //console.log(middleLocaltion);
      page.setData(middleLocaltion);

    }).exec();
  },


  getBound: function (child, success, pageCtx) {

    var ctx = pageCtx;
    if (!ctx) {
      var pages = getCurrentPages();
      ctx = pages[pages.length - 1];
    }
    
    var childQuery = wx.createSelectorQuery().in(ctx).select(child);
    childQuery.boundingClientRect(function (rect) {
      success && success(rect);
    }).exec();
  }


};