module.exports = function() {
  return function () {
    var e = {};
    return {
      addItem: function (i, t) {
        !e[i] && (e[i] = t);
        return t;
      },
      removeItem: function (i) {
        e[i] && delete e[i]
      },
      getItem: function (i) {
        return i ? e[i] : e
      },
      hasItem: function (i) {
        return !!e[i]
      },
      items: function () {
        return e;
      }
    }
  }()
}