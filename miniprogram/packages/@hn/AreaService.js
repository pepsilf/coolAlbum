const Sunrise = getApp().sunrise;

class AreaService extends Sunrise.Service {


  init() {

    //this.area = Sunrise.context.getBean("$$Server");


    //this.area = Sunrise.context.getBean("$area");
    //console.log('AreaService init ====> ', this.area);


  }

  /**
   * 
   * 查询地区接口
   * 
   */
  find(code) {

    let params = code ? {
      "codetype": "parentId",
      "code": code
    } : {
      "codetype": "level",
      "code": 1
    }

    return this.send({
      noLogin: true,
      url: Sunrise.config.bananaApi + "/area/query/areainfo/assemble",
      data: params,
    });

  }

  /**
   * 优选查询地区接口
   */
  findYx(id) {
    return this.get({
      noLogin: true,
      url: Sunrise.config.yxApi + '/area',
      data: {
        id: id || ''
      }
    })
  }


}

module.exports = AreaService;