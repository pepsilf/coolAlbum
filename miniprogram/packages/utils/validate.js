
import _ from './attr.js';


const ValidationMap = {
  /**
   * 是否手机号
   */
  isTel: {
    msg:'请填写正确的手机号码',
    expression: /^((13[0-9])|(15[0-35-9])|(18[0-9])|(14[5-9])|166|(17[0-9])|(19[8-9]))[0-9]{8,8}$/,
  }, 

  /**
   * 是否邮件
   */
  isEmail: {
    msg: '请填写正确的邮箱地址',
    expression: /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/,
  },

  /**
   * 是否日期
   */
  isDate: {
    msg: '请填写合法的日期',
    expression:/^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/,
  }, 

  /**
   * 是否中文
   */
  isChina: {
    msg: '请填写中文信息',
    expression: /^[\u4E00-\u9FA5]+$/
  } 
}

module.exports =  {
  
  /**
   * 
   * validators : {
   *    "name" : {
   *        required:true,
   *        emptyMsg:'Field is not empty.',
   *        error:{
   *            errorFn:Function // 返回验证信息
   *            validateFn:Function // 验证函数
   *            msg:'',
   *            expression:'' // 正则表达式
   *        }
   *    }
   * }
   * 
   *
   */
  // validators : {
  //     "name" : {
  //       required:true,
  //       emptyMsg:'Field is not empty.',
  //       error:{
  //             errorFn:Function, // 返回验证信息
  //             validateFn:Function, // 验证函数
  //             msg:'',
  //             expression:'' // 正则表达式
  //       }
  //   }
  // },

  doValidate(validators, params, valueField) {

    if (!_.isObject(validators)) {
        return [];
    }

    let errorMessages = [];
    for (let field in validators) {
      let validator = validators[field];
      let val = _.toValue(params, field);


      let errorMsg,
          required = !!validator.required,
          value = typeof (validator.valueFn) === 'function' ? (validator.valueFn.call(null, val, params) || val) : val;

      let isEmpty = value == undefined;

      _.isObject(value) && valueField && (value = value[valueField])
      _.isString(value) && (value = value.trim(), isEmpty = !value);

      if (required && isEmpty) {
        errorMsg = validator.emptyMsg || "Field : " + field + " is not empty.";
      }

      if (!errorMsg && !isEmpty) {
        let errorVo = (_.isString(validator.error) ? ValidationMap[validator.error] : validator.error) || {};
        let error = typeof (errorVo.errorFn) === 'function' ? errorVo.errorFn.call(validator, value) || errorVo : errorVo;

        if (error.expression instanceof RegExp && !error.expression.test(value)) {
            errorMsg = error.msg;
        }

        if (!errorMsg && typeof (error.validateFn) === 'function') {
          errorMsg = error.validateFn.call(validator, value, params);
        }
      }
      
      if (errorMsg) {
        errorMessages.push({
          field: field,
          errorMsg: errorMsg
        })
      }

    }
    return errorMessages;
  }
};

