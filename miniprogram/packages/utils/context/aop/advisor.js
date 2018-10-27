
module.exports = function (Sunrise) {

  class Advisor extends Sunrise.Service {

    /**
     * 前切面
     */
    onBefore(o, args) {
    }

    /**
     * 环绕
     */
    onAround(method, o, args) {
      method.apply(o,args);
    }

    /**
     * 后切面
     */
    onAfter(returnValue, o, args) {
    }
  }
  
  return Advisor;
}
