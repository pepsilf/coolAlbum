

import _ from './attr.js';

//const hasOwn = Object.prototype.hasOwnProperty;

const _override = (o) => {

  if (o.$super) {
    let sp = o.$super,
        t = [].slice,
        c = function (e, r) {
          return function () {
            var n = this, i = [function () {
              return sp[e].apply(n, arguments)
            }
            ];
            return r.apply(this, i.concat(t.call(arguments)))
          }
    },
      d = /^\s*function\b[^\(]*\(([^\(\)]*?)\)\s*?\{/i;
    for (var f in sp) {
      let v = o[f];
      let fs = d.exec(v.toString())[1].replace(/\s/i, "").split(",");
      "$super" === fs[0] && (o[f] = c(f, v))
    }
  }
}

const ON_OVERRIDE_METHODS = ['init','destroy'];
const _extends = (o, c) => {

  if (o && c && typeof c == 'object') {

    !o.$super && (o.$super = {});

    for (var p in c) {
      if (ON_OVERRIDE_METHODS.indexOf(p) == -1) {
        var v = c[p];
        var hasOwn = _.hasOwn.call(o, p);
        if (hasOwn) {
          if (_.isFunction(v)) {
            o.$super[p] = v;
          }
        }
        else if (v !== undefined) {
          o[p] = v;
        }
      }
    }
    _override(o);
  }
  return o;
}

module.exports = (sb,sp) => {
  return _extends(sb, sp);
};