
const hasOwn = Object.prototype.hasOwnProperty;
const getProto = Object.getPrototypeOf;
const toString = Object.prototype.toString;
const nativeIsArray = Array.isArray;
const fnToString = hasOwn.toString;
const ObjectFunctionString = fnToString.call(Object);


const isPlainObject = (obj) => {
  //const data = target.data;
  var proto, Ctor;
  if (!obj || toString.call(obj) !== "[object Object]") {
    return false;
  }
  proto = getProto(obj);
  if (!proto) {
    return true;
  }
  Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
  return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
}

const isArray = nativeIsArray || function (obj) {
  return toString.call(obj) === '[object Array]'
}

const isObject = function (obj) {
  var type = typeof obj
  return type === 'function' || type === 'object' && !!obj;
}

const isBoolean = function (obj) {
  return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
}

const isEmptyObject = function (obj) {
  for (const name in obj) {
    return false;
  }
  return true;
}

const isEmpty = function (obj) {
  if (isObject(obj)) return isEmptyObject(obj);
  return obj === undefined || obj === '';
}

const apply = (o, c) => {
  if (o && c && typeof c == 'object') {
    for (var p in c) {
      var v = c[p];
      if (hasOwn.call(o, p) || v !== undefined) {
        o[p] = v;
      }
    }
  }
  return o;
}

const applyVal = (o, c) => {
  if (o && c && typeof c == 'object') {
    for (var p in o) {
      var v = o[p];
      if (!v) {
        o[p] = c[p];
      }
    }
  }
  return o;
}

const applyAll = (o,c) => {
  if (o && c && typeof c == 'object') {
    for (var p in c) {
      var v = c[p];
      if (isObject(v)) {
        if (isObject(o[p])) {
          applyAll(o[p], v);
        }
        else {
          o[p] = v;
        }
      }
      else if (o.hasOwnProperty(p) || v !== undefined) {
        o[p] = v;
      }
    }
  }
  return o;
}

const applyIf = function(o, c) {
  if (o && c) {
    for (var p in c) {
      if (o[p] === undefined && c[p] !== undefined) {
        o[p] = c[p];
      }
    }
  }
  return o;
}

const _is = {};
['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'].forEach(v => {
  _is['is' + v] = function (obj) {
    return toString.call(obj) === '[object ' + v + ']';
  }
})



const toField = (str, data, thiv) => {
  return str.replace(/(?:\$\{([^{}]+)\})/gi,
    function (f) {
      f = f.replace(/\$|\{|\}/gi, '');
      return toValue(data, f, thiv);
    });
}

const toValue = (d, f, thiv) => {

  d = d || {};
  var sf = f.split(":");
  var s = sf[0].split(".");
  var p = s[0];
  var v = d[p];
  if (v && isObject(v)) {
    for (var j = 1; j < s.length; ++j) {
      v = v[s[j]];
    }
  }
  return v != undefined ? v : "";
}

const result = function(e, t) {
  if (null == e) return null;
  var r = _is.isFunction(t) ? t.call(e, e) : e[t];
  return _is.isFunction(r) ? r.call(e) : r;
}

// toValue: function(d, thiv) {
//   d = d || {};
//   var sf = this.split(":");
//   var s = sf[0].split(".");
//   var p = s[0];
//   var v = d[p];
//   if (v && 　$.isPlainObject(v)) {
//     for (j = 1; j < s.length; ++j) {
//       v = v[s[j]];
//     }
//   }

//   if (thiv && sf[1]) {
//     var f = "thiv." + sf[1];
//     eval("if (typeof " + f + " === 'function') v = " + f + ".call(thiv,v,d);");
//   }

//   if ($.isArray(v) && v.length > 0) {
//     if ($.isPlainObject(v[0]) && s[1]) {
//       v = v.toField(s[1]);
//     }
//     if (!$.isPlainObject(v[0]))
//       v = v.join(thiv ? (thiv.sp || ",") : ",");
//   }
//   return v != Eye.empty ? v : "";
// },

module.exports = apply({
  hasOwn: hasOwn,
  result: result,
  isPlainObject: isPlainObject,
  toValue: toValue,
  toField: toField,
  isArray: isArray,
  isObject: isObject,
  isBoolean: isBoolean,
  isEmptyObject: isEmptyObject,
  isEmpty: isEmpty,
  apply: apply,
  applyVal: applyVal,
  applyIf: applyIf,
  applyAll: applyAll
},_is);