import util from '../util.js'
import date from '../date.js'

const peach = function(sunrise) {

  const url = sunrise.config.env === 'prod' ? 'https://gather.cnhnb.com/peach/userlog/write/log/file/h5' : 'https://gather.cnhnkj.cn/peach/userlog/write/log/file/h5'
  const STORE_SPAN_ID = 'peach_parent_span_id'
  const STORE_REF = 'peach_ref'

  wx.setStorage({
    key: STORE_SPAN_ID,
    data: ''
  })
  wx.setStorage({
    key: STORE_REF,
    data: ''
  })

  return {

    logPage: function(pageName) {
      let _this = this
      let span_id_uid = util.generateUUID() //生成页面唯一id
      let parent_span_id = wx.getStorageSync(STORE_SPAN_ID) || ''
      wx.setStorage({
        key: STORE_SPAN_ID,
        data: span_id_uid
      })
      let projectName = sunrise.config.peachProjectName ? sunrise.config.peachProjectName + '/' : ''
      let logUrl = util.getCurrentPage() ? projectName + util.getCurrentPage().route : '获取url出错'
      let ref = wx.getStorageSync(STORE_REF) || ''
      wx.setStorage({
        key: STORE_REF,
        data: logUrl
      })
      let data = {
        'event_type': 'page', //所属的类型 用于区分大的打点类型
        'page': [{
          'device_id': util.getDeviceId(), //设备id
          'trace_id': util.getSessionId(), //一次系列页面访问的唯一标志 sessionID
          'span_id': span_id_uid, //一次具体页面访问的标志 自己生成唯一id
          'parent_span_id': parent_span_id, //上一次具体页面访问的标志 父自己生成唯一id
          'type': 'mp', //终端类型
          'ua': JSON.stringify(sunrise.sys), //User Agent
          'url': logUrl, //当前页面的url
          'ref': ref, //上一个页面的url
          'duration_time': '', //页面持续停留时间
          'page_id': 0, //当前页面编码
          'page_name': pageName, //当前页面的名称
          'request_date': date.format((new Date).getTime(), 'yyyy-MM-dd'), //访问页面的日期
          'timestamp': (new Date).getTime() //访问页面的准确时间
        }]
      }
      if (sunrise.config.env != 'prod') {
        console.log('页面埋点', data)
        return
      }
      wx.request({
        url: url,
        method: 'POST',
        data: data
      })
    },
    logEvent: _ => {
      if (typeof _ == 'string') {
        _ = {
          name: _
        }
      }
      let projectName = sunrise.config.peachProjectName ? sunrise.config.peachProjectName + '/' : ''
      let logUrl = util.getCurrentPage() ? projectName + util.getCurrentPage().route : '获取url出错'
      let ref = wx.getStorageSync(STORE_REF) || ''
      wx.setStorage({
        key: STORE_REF,
        data: logUrl
      })
      let data = {
        'event_type': 'event', //所属的类型
        'event': [{
          'device_id': util.getDeviceId(), // 设备id
          'trace_id': util.getSessionId(), // 一次系列页面访问的唯一标志 sessionID
          'span_id': util.generateUUID(), // 一次具体页面访问的标志 自己生成唯一id
          'web_event_uid': util.generateUUID(), // 每次点击事件唯一id
          'web_event_id': 0, // 事件id
          'web_event_name': _.name, // 事件名称
          'web_business_event': _.data || '', // 业务事件数据
          'event_type': 'click',
          'type': 'mp', //终端类型
          'web_path': logUrl, // 浏览web的path  预留暂时不传
          'ua': JSON.stringify(sunrise.sys), // User Agent
          'request_date': date.format((new Date).getTime(), 'yyyy-MM-dd'), //日期
          'timestamp': (new Date).getTime() // 访问页面的准确时间
        }] //事件记录list
      }
      if (sunrise.config.env != 'prod') {
        console.log('事件埋点', data)
        return
      }
      wx.request({
        url: url,
        method: 'POST',
        data: data
      })

    }
  }
}

module.exports = peach