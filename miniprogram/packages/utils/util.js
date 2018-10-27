const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const generateUUID = () => {
  let d = new Date().getTime()
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
  return uuid
}

const getCurrentPage = () => {
  var pages = getCurrentPages()    //获取加载的页面
  return pages[pages.length - 1]
}

const getPrePage = () => {
  var pages = getCurrentPages()    //获取加载的页面
  if (pages.length >= 2) {
    return pages[pages.length - 2]
  }
}

const STORE_DEVICE_ID = 'device_id'
let cachedDeviceId = ''
const getDeviceId = () => { // 获取设备id
  if (cachedDeviceId) {
    return cachedDeviceId
  }
  let deviceId = wx.getStorageSync(STORE_DEVICE_ID)
  if (!deviceId) {
    deviceId = util.generateUUID()
    wx.setStorageSync(STORE_DEVICE_ID, deviceId)
  }
  cachedDeviceId = deviceId
  return deviceId
}

let cachedSessionId = ''
const getSessionId = () => { // 获取回话id
  if (!cachedSessionId) {
    cachedSessionId = util.generateUUID()
  }
  return cachedSessionId
}

const sleep = (numberMillis) => {
  let exitTime = new Date().getTime() + numberMillis;
  while(true) {
    if (new Date().getTime() > exitTime)
      return;
  }
}

const wait = (scope, flagField, method, args) => {
  if (scope && scope[flagField]) {
    return true;
  }
  else {
    let fn = scope[method];
    if(typeof fn == 'function'){
      fn._waitcount = fn._waitcount || 1;
      if (fn._cellUpdateTimeout) clearTimeout(fn._cellUpdateTimeout);
      if (fn._waitcount < 10) {
        fn._cellUpdateTimeout = setTimeout(() => {
          fn._waitcount++;
          if (wait(scope, method, args, flagField)) {
            fn.apply(scope, args || [])
          }
        }, 200);
      }
    }
  }
}

const newId = () => {
  var a = (new Date().getTime() + Math.random());
  return a.toString(16).replace(".", "").slice(8)
}


const util = {
  newId: newId,
  wait: wait,
  sleep: sleep,
  getDeviceId: getDeviceId,
  getSessionId: getSessionId,
  randomInt: randomInt,
  generateUUID: generateUUID,
  getCurrentPage: getCurrentPage,
  getPrePage: getPrePage
}

export default util