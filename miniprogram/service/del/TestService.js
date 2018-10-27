const Sunrise = getApp().sunrise;

// "navigationStyle": "custom",
class TestService extends Sunrise.Service {

  init() {
    
    // this.$area = Sunrise.context.getBean('$area')

    // this.$area = Sunrise.context.getBean('$$auth')

    this.$area = Sunrise.context.getBean('@area')

    this.$area = Sunrise.context.getBean('@area.test')

    console.log('int Del.TestService==>', this.$area);

    return this.$area.find();
  }

  
  

  /**
   * 获取用户信息
   */
  getUserInfo() {

    console.log('int model', this.model);
    return new Promise((resolve, reject) => {

    })
  }

}

module.exports = TestService;