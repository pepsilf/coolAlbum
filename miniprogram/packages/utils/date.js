
import _ from './attr.js';

const weeks = ['日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
const gaps = [{ s: "年", l: 365 * 86400000 },
{ s: "个月", l: 30 * 86400000 },
{ s: "天", l: 86400000 },
{ s: "小时", l: 3600000 },
{ s: "分钟", l: 60000 },
{ s: "秒", l: 1000 }]


const _dataFormat = function (d, f) {
  //d = toDate(d);
  d = _.isDate(d) ? d : toDate(d);
  f = f || 'yyyy-MM-dd hh:mm:ss';
  let w = '星期', r = {
    yyyy: d.getFullYear(),
    MM: d.getMonth() + 1,
    dd: d.getDate(),
    hh: d.getHours(),
    mm: d.getMinutes(),
    ss: d.getSeconds(),
    ww: w + weeks[d.getDay()],
    SSS: d.getMilliseconds()
  }

  for (let k in r) {
    let v = r[k]
    if (k != 'yyyy' && v < 10) r[k] = '0' + v
  }
  return f.replace(/(?!\\)(yyyy|MM|dd|SSS|hh|mm|ss|ww)/gi, function (f) {
    return r[f]
  })
}

function toDate(v) {
  let t
  typeof v == 'string' && (t = v.indexOf('-') != -1 ? new Date(Date.parse(v.replace(/-/g, '/'))) : new Date(Number(v)))
  return !t && (t = new Date(v)), t
}

function toUp(dtTmp, strInterval, num) {
  switch (strInterval) {
    case 's': return new Date(Date.parse(dtTmp) + (1000 * num));
    case 'n': return new Date(Date.parse(dtTmp) + (60000 * num));
    case 'h': return new Date(Date.parse(dtTmp) + (3600000 * num));
    case 'd': return new Date(Date.parse(dtTmp) + (86400000 * num));
    case 'w': return new Date(Date.parse(dtTmp) + ((86400000 * 7) * num));
    case 'q': return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + num * 3, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
    case 'm': return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + num, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
    case 'y': return new Date((dtTmp.getFullYear() + num), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
  }
  return dtTmp;
}

function toDown(dtTmp, strInterval, num) {
  switch (strInterval) {
    case 's': return new Date(Date.parse(dtTmp) - (1000 * num));
    case 'n': return new Date(Date.parse(dtTmp) - (60000 * num));
    case 'h': return new Date(Date.parse(dtTmp) - (3600000 * num));
    case 'd': return new Date(Date.parse(dtTmp) - (86400000 * num));
    case 'w': return new Date(Date.parse(dtTmp) - ((86400000 * 7) * num));
    case 'q': return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) - num * 3, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
    case 'm': return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) - num, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
    case 'y': return new Date((dtTmp.getFullYear() - num), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
  }
  return dtTmp;
}

const strIntervals = ['s', 'n', 'h', 'd', 'w', 'q', 'm', 'y'];
function getUpTime(expires, date) {
  let len = expires.length;
  if (len > 1) {
    for (var i = 1; i < len; i++) {
      var v = expires.charAt(i).toLowerCase();
      var index = strIntervals.indexOf(v);
      if (index != -1) {
        var n = expires.substring(0, i);
        var s = strIntervals[index];
        date = toUp(date || new Date(), s, Number(n));
        let _expires = expires.substring(i + 1);
        if (_expires) {
          return getUpTime(_expires, date);
        }
      }
    }
  }
  return date;
}

const date = {

  toUp: toUp,

  toDown: toDown,

  toDate: toDate,

  toFormat: _dataFormat,

  getUpTime: getUpTime,

  intervalId: 0,

  format: function (v, f) {
    let d = toDate(v)
    return _dataFormat(d, f)
  },

  now: function (f) {
    return _dataFormat(new Date(), f || 'yyyy-MM-dd hh:mm:ss.SSS')
  },

  toTime: function (n) {
    function a(v) {
      return (v >= 10 ? v : "0" + v);
    }
    if (n < 60) {
      return "00:" + a(n);
    }
    else {
      var ss = n % 60;
      var mm = Math.floor(n / 60);
      if (mm < 60) {
        return a(mm) + ":" + a(ss);
      }
      else {
        mm = mm % 60;
        var hh = Math.floor(mm / 60);
        return a(hh) + ":" + a(mm) + ":" + a(ss);
      }
    }
    return "00:00";
  },

  // toBytes: function (n) {
  //   var k = n / 1024;
  //   if (k < 1024) return Math.ceil(k) + "KB";
  //   var m = k / 1024;
  //   if (m < 1024) return (m).toFixed(2) + "MB";
  //   return (m / 1024).toFixed(2) + "GB";
  // },

  gapTime: function (t, s) {
    t = toDate(t), s = toDate(s);
    let v = Math.abs(t.getTime() - s.getTime());
    function gapTo(i) {
      let d = gaps[i]
      let val = Math.floor(v / d.l);
      if (val > 0) { return val + d.s; }
      return i < 5 ? gapTo(i + 1) : "刚刚";
    }
    return gapTo(0)
  },

  // 详细的时间间隔
  detailGapTime: function (t, s) {
    t = toDate(t), s = toDate(s);
    let gap = Math.abs(t.getTime() - s.getTime());
    let result = ''
    let count = 0
    function calc(remain) {
      for (let i = 0; i < gaps.length; i++) {
        let v = gaps[i]
        let val = Math.floor(remain / v.l);
        if (val > 0) {
          result += val + v.s
          count += 1
          if (count >= 2) {
            return
          } else {
            calc(remain - val * v.l)
            break;
          }
        }
      }
    }
    calc(gap)
    return result
  },

  gapTimeInterval: function (option) {
    let begin = option.begin
    let end = option.end
    let up = option.up
    if (begin && up) {
      end = getUpTime(up, toDate(begin))
    }
    if (!end) {
      return
    }
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
    this.intervalId = setInterval(() => {
      let now = new Date()
      option.counter && option.counter(this.detailGapTime(now, end))
      if (now.getTime() == end.getTime()) {
        option.finish && option.finish()
        clearInterval(this.intervalId)
      }
    }, 1000)
  }
}

module.exports = date