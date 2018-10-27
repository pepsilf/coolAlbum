
import _ from '../attr.js';
import http from '../widget/http.js';

const buildCache = require("../cache.js");

const cache = buildCache();
const cacheKey = "scope.userLocation";

module.exports = {

  init: function (next) {

    //console.log("location");

    if (!this.userLocation) {

      wx.authorize({
        scope: "scope.userLocation",
        success: res => {
          wx.getLocation({
            type: 'gcj02', //返回可以用于wx.openLocation的经纬度
            success: r => {
              http.send({
                url: this.data.env.baseApi + "/lbs/getLocation",
                header: {
                  'content-type': 'application/json',
                },
                method: "GET",
                data: {
                  lat: r.latitude,
                  lng: r.longitude
                },
                success: res => {
                  if (!res.errorCode) {
                    let result = res.data.result;
                    let userLocation = {
                      location: result.address_component,
                      addresses: result.formatted_addresses,
                    }

                    this.userLocation = userLocation;

                    console.log("userLocation", userLocation);

                    if (_.isFunction(this.onRegisterUserLocationCallback)) {
                      this.onRegisterUserLocationCallback();
                    }
                  }
                  
                }
              });

            }
          })
        }
      })

    }

    next();


  }

};