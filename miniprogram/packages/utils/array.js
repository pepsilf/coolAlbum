
import _ from './attr.js';

const splitRows = function (ds, splitCount) {
  
  if (_.isArray(ds)) {
    let rs = [[]],ls;
    ds.forEach(v => {
      ls = rs[rs.length-1];
      if (ls.length >= splitCount) {
        ls = [];
        rs.push(ls);
      }
      ls && ls.push(v)
    })
    ls = rs[rs.length - 1];
    if (ls && ls.length < splitCount) {
      for (let i = 0, s = splitCount - ls.length;i<s;i++) {
        ls.push(null);
      }
    }
    return rs;
  }
  return ds;

}



const sortGroupByFirstChar = (ds, field, splitCount) => {
  let gs = [], map = {};
  if (field) {
    for (var i = 0, l = ds.length; i < l; i++) {
      var d = ds[i],
        v = d[field],
        c = v ? v.charAt(0).toUpperCase() : "";

      if (c) {
        !map[c] && (map[c] = []);
        map[c].push(d);
      }
    }
    for (var c in map) {
      gs.push({
        char: c,
        list: splitCount ? splitRows(map[c], splitCount) : map[c]
      })
    }
    gs.sort(function (a, b) {
      var arr = [a.char, b.char];
      arr.sort();
      return arr.indexOf(a.char) ? 1 : -1
    })
  }
  return gs;
}


const isIndex = function(ds, index) {
  return Array.isArray(ds) ? index >= 0 && index < ds.length : false;
}

const addAt = function (ds, v, index) {
  if (!isIndex(ds, index))
    return;

  ds.splice(index, 0, v);
}

const removeAt = function (ds, index) {
  if (!isIndex(ds, index))
    return;

  return ds.splice(index, 1)[0];
}

const moveAt = function(ds, index, isDown) {

  var selectIndex = Number(index);
  selectIndex = isDown ? selectIndex + 1 : selectIndex - 1;

  if (isIndex(ds, selectIndex)) {
    var v = removeAt(ds, selectIndex);
    index != ds.length ? addAt(ds, v, index) : ds.push(v);
    return selectIndex;
  }
  return index;
}

const indexAt = function(ds, v, f) {
  if (v != undefined && f) {
    var len = ds.length;
    var index = -1;
    for (var i = 0; i < len; i++) {
      if (ds[i][f] == v) {
        index = i;
        break;
      }
    }
    return index;
  }
  return ds.indexOf(v);
}

const indexAtItem = function(ds, v, f) {
  var index = indexAt(ds, v, f);
  return isIndex(ds, index) ? ds[index] : undefined;
}

const indexAtValue =  function(ds, v, pf, vf) {
  var obj = indexAtItem(ds, v, pf);
  return obj && vf ? obj[vf] : undefined;
}


// res = res.filter(val => {
//   if (this.idFilter.some(item => {
//     return item == val.id
//   })) {
//     return true
//   } else {
//     return false
//   }
// })


const filter = function(ds,filters,field) {
  return ds.filter(v => {
    return filters.some(item => {
      return item == v[field]
    })
  })
}


module.exports = {

  isIndex: isIndex,

  addAt: addAt,

  removeAt: removeAt,

  moveAt: moveAt,

  indexAt: indexAt,

  indexAtItem: indexAtItem,

  indexAtValue: indexAtValue,

  splitRows: splitRows,

  filter: filter,

  /**
   * 
   * 通过首字母分组
   * 
   */
  sortGroupByFirstChar: sortGroupByFirstChar
};