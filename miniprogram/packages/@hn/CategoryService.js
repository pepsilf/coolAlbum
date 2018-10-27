const Sunrise = getApp().sunrise;

class CateGoryService extends Sunrise.Service {


  init() {

  }


  /**
   * 
   * 类目组件适用于大网
   * 
   */
  find(code, paramster) {

    let params = code ? {
      "codetype": "parentId",
      "code": code
    } : {
      "codetype": "level",
      "code": 0
    }
    return this.send({
      url: Sunrise.config.bananaApi + "/category/query/categories",
      data: params,
    }).then(res => {
      return code ? res.categorys : res;
    });
  }


  /**
   * 行情项目专用的类目接口
   */
  findMarket(code, paramster) {
    let params = code ? {
      "id": code
    } : {
      "id": 0
    }

    return this.send({
      contentType:'form',
      url: Sunrise.config.baseApi + "/market/queryVariety",
      data: Sunrise._.apply(params, paramster || {}),
    });
  }

  findBreeds(cateId) {
    return this.send({
      noLogin: true,
      url: Sunrise.config.bananaApi + "/category/query/spec/breed",
      data: {
        "cateId": cateId
      }
    });
  }

}

module.exports = CateGoryService;