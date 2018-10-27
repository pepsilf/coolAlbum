import _ from '../utils/attr.js';

export default env => {
  const setting = require('./env/' + env + '.env');
  const config = require('../../config/' + env + '.config');
  return _.apply(config, setting);
}