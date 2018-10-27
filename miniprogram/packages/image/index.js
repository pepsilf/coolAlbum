const qiniuUploader = require("../utils/qiniu");
const warkmark = require('../utils/warkmark.js');
const HN_DEFAULT_IMG = '/packages/resources/images/img-default.jpg'
const Sunrise = getApp().sunrise

Component({

  externalClasses: ['image-class', 'image-group-class'],

  options: {
    multipleSlots: true
  },

  properties: {
    defaultImg: { // 默认图片
      type: String,
      value: Sunrise.config.image && Sunrise.config.image.defaultImg || HN_DEFAULT_IMG
    },
    local: Boolean, // 是否本地图片
    src: { // 图片地址
      type: String,
      value: Sunrise.config.image && Sunrise.config.image.defaultImg || HN_DEFAULT_IMG,
      observer: function() {
        this.setThumbSrc()
      }
    },
    srcList: { // 图片地址列表
      type: Array,
      observer: function() {
        this.setThumbSrc()
      }
    },
    origin: { // 图片默认会根据布局大小切割，origin为true的话则不切割
      type: Boolean,
      value: Sunrise.config.image && Sunrise.config.image.origin
    },
    upload: Number, // 是否选择图片上传，是的话直接传选择的图片数
    warkText: String, // 水印文字
    preview: Boolean, // 是否点击预览，默认不预览
    mode: { // 预览图的mode
      type: String,
      value: 'aspectFill'
    },
    previewList: Array // 图片列表，预览的时候可以传，预览多张图片
  },

  ready: function() {
    this.setData({
      inited: true
    })
    this.setThumbSrc()
  },

  data: {
    inited: false,
    thumbSrc: '', // 缩略图
    thumbSrcList: [] // 缩略图列表
  },

  methods: {
    isUploadImage: function(src) { // 判断是否待上传的图片
      if (src) {
        return src.indexOf('http://tmp/') !== -1 || src.indexOf('wxfile://') !== -1
      } else {
        return false
      }
    },

    upload: function(success, fail) { // 上传图片
      let srcList = this.properties.srcList
      let index = 0
      let _this = this
      let getNextUploadFile = function() { // 取下一张需要上传的图片
        if (srcList.length > index) {
          if (_this.isUploadImage(srcList[index])) { // 根据文件路径判断是否需要上传
            return srcList[index]
          } else {
            index++
            return getNextUploadFile()
          }
        } else {
          return null
        }
      }
      let showingLoading = false
      let doUpload = function() { // 执行上传
        let file = getNextUploadFile()
        if (!file) {
          showingLoading && wx.hideLoading()
          success && success(srcList)
          return
        };
        if (!showingLoading) {
          wx.showLoading({
            title: '上传中...',
          })
          showingLoading = true
        }
        qiniuUploader.upload(file, res => {
          console.log('上传成功', res)
          srcList[index] = res.src
          doUpload()
        }, err => {
          console.log("qiniu Error:", err);
          wx.hideLoading()
          fail && fail(err)
        })
      }
      doUpload()
    },

    onError: function(e) {
      this.setData({
        thumbSrc: this.properties.defaultImg
      })
    },

    onLoad: function(e) {
      this.triggerEvent('load', e.detail)
    },

    onImageClick: function(e) { // 点击图片
      let _this = this
      let p = this.properties
      if (p.upload == 1) { // 如果是上传图片，并且数量只有一张，就不预览，点击直接选图片
        this.addImg()
        return
      }
      if (!p.preview) {
        return
      }
      let urls = []
      let src = ''
      if (p.srcList.length) {
        urls = p.srcList
        src = e.currentTarget.dataset.src
      } else {
        urls = p.previewList.length > 0 ? p.previewList : [p.src]
        src = _this.waterMark(_this.concatQiqiu(p.src))
      }
      urls = urls.map(val => {
        return _this.waterMark(_this.concatQiqiu(val))
      })
      wx.previewImage({
        urls: urls,
        current: src
      })
    },

    addImg: function() { // 添加图片
      let srcList = this.properties.srcList
      let thumbSrcList = this.data.thumbSrcList
      let upload = this.properties.upload
      let count = upload == 1 ? 1 : upload - srcList.length
      let _this = this
      wx.chooseImage({
        count: count, // 数量
        sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function(res) {
          let paths = res.tempFilePaths
          srcList = upload == 1 ? paths : srcList.concat(paths)
          thumbSrcList = upload == 1 ? paths : thumbSrcList.concat(paths)
          _this.setData({
            srcList: srcList,
            thumbSrcList: thumbSrcList
          })
          _this.triggerEvent('onImageChange', srcList)
        }
      })
    },

    removeImg: function(e) { // 移除图片
      let index = e.currentTarget.dataset.index
      let temp = this.properties.srcList
      temp.splice(index, 1)
      let thumbSrcList = this.data.thumbSrcList
      thumbSrcList.splice(index, 1)
      this.triggerEvent('onImageChange', temp)
      this.setData({
        srcList: temp,
        thumbSrcList: thumbSrcList
      })
    },

    waterMark: function(src) { // 加水印
      let warkText = this.properties.warkText;
      return warkText ? warkmark.handler(src, warkText) : src;
    },

    concatQiqiu: function(src) { // 拼接图片地址
      if (this.isUploadImage(src)) {
        return src
      }
      if (this.properties.local) {
        return src
      }
      if (!src || src === this.properties.defaultImg) { // 如果图片为空，显示默认图片
        src = this.properties.defaultImg
      } else if (src.indexOf('http') === -1) { // 图片不带域名，自动带上七牛域名
        if (src.indexOf('//img.cnhnb.com') !== -1 || src.indexOf('//img.cnhnkj.cn') !== -1 || src.indexOf('//image.cnhnb.com') !== -1) {
          return 'http:' + src
        }
        if (Sunrise.config.env === 'prod') {
          if (src.indexOf('transcode/') !== -1 || src.indexOf('image/') !== -1 || src.indexOf('file/') !== -1) {
            src = 'https://image.cnhnb.com/' + src
          } else {
            src = 'https://img.cnhnb.com/' + src
          }
        } else {
          src = 'https://img.cnhnkj.cn/' + src
        }
      }
      return src
    },

    setThumbSrc: function() { // 根据布局大小设置缩略图
      if (this.data.inited) {
        let _this = this;
        let doSet = function(reslove) {
          if (_this.properties.srcList.length) {
            let temp = _this.properties.srcList
            temp = temp.map(val => {
              return reslove(_this.concatQiqiu(val))
            })
            _this.setData({
              thumbSrcList: temp
            })
          } else {
            let src = _this.concatQiqiu(_this.properties.src)
            _this.setData({
              thumbSrc: reslove(src)
            })
          }
        }
        if (this.properties.origin) { // 是否显示全图
          doSet(src => {
            return _this.waterMark(src)
          })
        } else {
          // 先查询组件的宽高，然后通过七牛的参数对图片进行裁剪
          var query = wx.createSelectorQuery().in(this)
          setTimeout(function() {
            query.select('.image-class').boundingClientRect(function(res) {
              if (!res) {
                return
              }
              // 以防图片太小模糊
              let width = Math.max(128, Math.floor(res.width))
              let height = Math.max(128, Math.floor(res.height))
              let reslove = function(src) {
                let thumbSrc
                if ((src.indexOf('img.cnhnb.com') !== -1 || src.indexOf('image.cnhnb.com') !== -1 || src.indexOf('img.cnhnkj.cn') !== -1) && src.indexOf('?') === -1 && res) {
                  thumbSrc = src + '?imageView2/2/w/' + width + '/h/' + height + '/q/100'
                } else {
                  thumbSrc = src
                }
                return _this.waterMark(thumbSrc);
              }
              doSet(reslove)
            }).exec()
          }, 20)
        }
      }
    }
  }
})