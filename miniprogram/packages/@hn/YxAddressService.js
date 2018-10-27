const Sunrise = getApp().sunrise;

/**
 * 优选地址相关接口
 */
class YxAddressService extends Sunrise.Service {

  create() {
    this.yxUser = Sunrise.context.getBean('$@hn.YxUserService')
  }

  /**
   * 修改默认地址
   */
  changeDefault(address) {
    return this.yxUser.request(() => {
      return this.post({
        loading: true,
        url: Sunrise.config.truffleApi + '/nsy/api/shareuser/setuseraddressdefault',
        data: {
          id: address.id
        }
      })
    })
  }

  /**
   * 查询默认地址
   */
  queryDefaultAddress() {
    return this.yxUser.request(() => {
      return this.get({
        isToastError: false,
        url: Sunrise.config.truffleApi + '/nsy/api/shareuser/getuseraddressdefault',
      }).then(res => {
        return this.convertToCommon(res)
      })
    })
  }

  /**
   * 查询地址列表
   */
  queryAddressList() {
    return this.yxUser.request(() => {
      return this.get({
        url: Sunrise.config.truffleApi + '/nsy/api/shareuser/getuseraddresslist',
      }).then(res => {
        return res.map(val => {
          return this.convertToCommon(val)
        })
      })
    })
  }

  // 添加收货地址
  addAddress(address) {
    return this.yxUser.request(() => {
      return this.post({
        url: Sunrise.config.truffleApi + '/nsy/api/shareuser/adduseraddress',
        data: this.convertToAddress(address)
      })
    })
  }

  // 更新收货地址
  updateAddress(address) {
    return this.yxUser.request(() => {
      return this.post({
        url: Sunrise.config.truffleApi + '/nsy/api/shareuser/updateuseraddress?id=' + address.id,
        data: this.convertToAddress(address)
      })
    })
  }

  // 删除地址
  deleteAddress(address) {
    return this.yxUser.request(() => {
      return this.get({
        url: Sunrise.config.truffleApi + '/nsy/api/shareuser/deleteuseraddress',
        data: {
          id: address.id
        }
      })
    })
  }

  // 自动识别地址
  autoDetect(str) {
    return this.get({
      noLogin: true,
      url: Sunrise.config.yxApi + '/area/match',
      data: {
        address: str
      }
    })
  }

  // 优选地址转成普通地址
  convertToCommon(address) {
    return {
      id: address.id,
      isDefault: address.isCommon,
      name: address.userName,
      mobile: address.userMobile,
      provinceName: address.province,
      cityName: address.city,
      areaName: address.area,
      detailInfo: address.fullAddress,
      provinceId: address.provinceId,
      cityId: address.cityId,
      areaId: address.areaId
    }
  }

  // 普通地址转成优选地址
  convertToAddress(common) {
    return {
      id: common.id,
      userName: common.name,
      userMobile: common.mobile,
      province: common.provinceName,
      city: common.cityName,
      area: common.areaName,
      fullAddress: common.detailInfo,
      isCommon: common.isDefault,
      provinceId: common.provinceId,
      cityId: common.cityId,
      areaId: common.areaId
    }
  }
}

module.exports = YxAddressService;