

import create from './create.js';
import context from './context.js';

import advisorManager from './aop/advisor-manager.js';
import advisor from './aop/advisor.js';

export default {

  install(Sunrise) {


    Sunrise.context = context(Sunrise);
    Sunrise.advisorManager = advisorManager(Sunrise);

    Sunrise.Advisor = advisor(Sunrise);
    
    Sunrise.Page = create(Sunrise, 'Page');
    Sunrise.Component = create(Sunrise, 'Component');
    Sunrise.Behavior = create(Sunrise, 'Behavior');

  },

  
}