Component({

  externalClasses: ['video-class'],

  properties: {
    canPlay: Boolean, // 视频是否点击播放
    src: { // 视频地址
      type: String,
      observer: function() {
        this.setThumbSrc()
      }
    },
    playState: { // 视频播放状态，不播放时显示图片，播放时显示视频
      type: Number,
      value: 0
    },
    videoPause: { // 是否暂停视频播放
      type: Boolean,
      observer: function() {
        let playState = this.properties.playState
        let ctx = wx.createVideoContext('myVideo', this)
        if (playState === 1) {
          if (this.properties.videoPause || this.data.handPause) {
            ctx.pause()
          } else if (!this.properties.videoPause && !this.data.handPause) {
            ctx.play()
          }
        }
      }
    },
    mode: { // 预览图的mode
      type: String,
      value: 'aspectFill'
    },
  },

  ready() {
    this.setData({
      inited: true
    })
    this.setThumbSrc()
  },

  data: {
    inited: false,
    handPause: false // 手动点击暂停
  },

  methods: {
    concatQiqiu: function(src) { // 拼接图片地址
      // 如果传进来的视频地址没有加域名，先加上域名
      if (src.indexOf('http') === -1) {
        src = 'https://video.cnhnb.com/' + src
        this.setData({
          src: src
        })
      }
      src = src.replace('.mp4', '.jpg')
      return src
    },

    playVideo: function() { // 点击播放按钮
      if (!this.properties.canPlay) {
        return
      }
      this.setData({
        playState: 1
      })
      let ctx = wx.createVideoContext('myVideo', this)
      ctx.play()
      ctx.requestFullScreen()
    },

    onVideoEnd: function() { // 视频播放完
      this.setData({
        playState: 0
      })
      let ctx = wx.createVideoContext('myVideo', this)
      ctx.exitFullScreen()
    },

    onVideoPause: function() { // 视频暂停
      this.setData({
        handPause: 1
      })
    },

    onVideoPlay: function() { // 视频继续播放
      this.setData({
        handPause: 0
      })
    },

    setThumbSrc: function() { // 设置视频的封面图
      if (this.data.inited) {
        let src = this.concatQiqiu(this.properties.src)
        this.setData({
          thumbSrc: src
        })
      }
    }

  },
})