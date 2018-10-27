import _ from '../attr.js';
import validate from '../validate.js';

module.exports = {

  doValidate: function (validators,params) {

    let errorMessages = validate.doValidate(validators, params || this.data.model);
    console.log('errorMessages:', params, errorMessages,this.data.model);

    if (errorMessages.length) {

      let error = errorMessages[0];

      wx.showToast({ title: error.errorMsg,icon : 'none'});

      return false;
    }

    return true;
    


  }

};