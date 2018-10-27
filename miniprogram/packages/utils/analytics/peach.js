import util from '../util.js'
import date from '../date.js'

const STORE_SPAN_ID = 'peach_parent_span_id'

module.exports = function(Sunrise) {

  class Peach {

    constructor() {
      this.url = Sunrise.config.env === 'prod' ? 'https://gather.cnhnb.com/peach/userlog/write/log/file/h5' : 'https://gather.cnhnkj.cn/peach/userlog/write/log/file/h5'
    }

    init(options) {
      Sunrise.store.set(STORE_SPAN_ID, '')
    }

    _getProjectName() { // 获取埋点的项目名
      if (!this.projectName) {
        this.projectName = Sunrise.config.mta ? (Sunrise.config.mta.projectName || '') + '/' : ''
      }
      return this.projectName
    }

    _getUrl() { // 获取埋点的url
      let projectName = this._getProjectName()
      let logUrl = projectName + util.getCurrentPage().route
      return logUrl
    }

    _commonData() { // 事件/页面埋点共同的参数
      return {
        'device_id': util.getDeviceId(), // 设备id
        'trace_id': util.getSessionId(), // 一次系列页面访问的唯一标志 sessionID
        'span_id': util.generateUUID(), // 一次具体页面访问的标志 自己生成唯一id
        'type': 'mp', //终端类型
        'ua': JSON.stringify(Sunrise.sys), // User Agent
        'request_date': date.format((new Date).getTime(), 'yyyy-MM-dd'), //日期
        'timestamp': (new Date).getTime() // 访问页面的准确时间
      }
    }

    _send(data) { // 发送请求
      wx.request({
        url: this.url,
        method: 'POST',
        data: data
      })
    }

    stat() {
      if (!arguments.length) {
        Sunrise.logger.error('事件埋点请传入事件名称')
        return
      }
      let logUrl = this._getUrl()
      let data = {
        'event_type': 'event', //所属的类型
        'event': [{
          'web_event_uid': util.generateUUID(), // 每次点击事件唯一id
          'web_event_id': 0, // 事件id
          'web_event_name': arguments[0], // 事件名称
          'web_business_event': arguments.length >= 2 ? (arguments[1] || '') : '', // 业务事件数据
          'event_type': 'click',
          'web_path': logUrl, // 浏览web的path  预留暂时不传
          ...this._commonData()
        }] //事件记录list
      }
      Sunrise.logger.info('事件埋点', data)
      if (Sunrise.config.env == 'prod') {
        this._send(data)
      }
    }

    pageInit() {
      let span_id_uid = util.generateUUID() //生成页面唯一id
      let parent_span_id = Sunrise.store.get(STORE_SPAN_ID) || ''
      Sunrise.store.set(STORE_SPAN_ID, span_id_uid)
      let pageUrl = util.getCurrentPage().route // 当前页面的url
      let logUrl = this._getProjectName() + pageUrl // 上报的url要加上项目名
      let prePage = Sunrise.util.getPrePage()
      let ref = prePage ? this._getProjectName() + prePage.route : ''
      let pageName = logUrl
      if (Sunrise.config.mta && Sunrise.config.mta.pages) {
        pageName = Sunrise.config.mta.pages[pageUrl] || logUrl
      }
      let data = {
        'event_type': 'page', //所属的类型 用于区分大的打点类型
        'page': [{
          'parent_span_id': parent_span_id, //上一次具体页面访问的标志 父自己生成唯一id
          'url': logUrl, //当前页面的url
          'ref': ref, //上一个页面的url
          'duration_time': '', //页面持续停留时间
          'page_id': 0, //当前页面编码
          'page_name': pageName, //当前页面的名称
          ...this._commonData()
        }]
      }
      Sunrise.logger.info('页面埋点', data)
      if (Sunrise.config.env == 'prod') {
        this._send(data)
      }
    }
  }

  return new Peach();
}