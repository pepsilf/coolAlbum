'use strict';

const Sunrise = getApp().sunrise;
const Popup = require('../utils/behavior/popup.js');
const Dialog = require('../utils/behavior/dialog.js');

Sunrise.Component({

  mixins: [Dialog],
});