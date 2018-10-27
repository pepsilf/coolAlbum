const Sunrise = getApp().sunrise;

/**
 * 惠农网地址相关接口
 */
class HnAddressService extends Sunrise.Service {

  create() {
    this.hnUser = Sunrise.context.getBean('$$HnUserService')
  }

}

module.exports = HnAddressService;