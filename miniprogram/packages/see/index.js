// packages/see/index.js

const Bound = require('../utils/bound.js')
const _ = require('../utils/attr.js')

const Sunrise = getApp().sunrise;


    //   this.ctx.save();
    //   this.ctx.setFontSize(options.size);
    //   this.ctx.setFillStyle(options.fillStyle);
    //   this.ctx.setTextAlign(options.textAlign);
    //   this.ctx.fillText(options.text, options.x, options.y);
    //   this.ctx.restore();
    //   this.ctx.draw(true);
const DrawUtil = {

  _setting(ctx,options) {

    if (options.strokeWidth) {
      ctx.setStrokeStyle(options.strokeStyle)
      ctx.setLineWidth(options.strokeWidth)
      ctx.stroke()
    }

    if (options.fillStyle) {
      ctx.setFillStyle(options.fillStyle)
      ctx.fill()
    }
  },

  drawImage(ctx,options) { 
    let cx = ( options.cw ) * 0.5;
    let x = options.align == 'center' ? cx : options.x;

    //debugger
    ctx.save()
    if (options.mode == 'arc') {

      /**
       * 半径
       */
      let r = options.w * 0.5;
      ctx.beginPath()
      ctx.arc(x, options.y, r , 0, 2 * Math.PI)
      DrawUtil._setting(ctx, options);
      ctx.closePath()
      ctx.clip()
      

      ctx.drawImage(options.src, x - options.dw * 0.5, options.y - options.dh * 0.5, options.dw, options.dh);
    }
    else if (options.mode == 'rect') {

      ctx.beginPath()
      ctx.fillRect(x - options.dw * 0.5, options.y, options.dw, options.dh)
      DrawUtil._setting(ctx, options);
      ctx.closePath()

      let _x = options.strokeWidth ? x - options.dw * 0.5 + options.strokeWidth : x - options.dw * 0.5;
      let _y = options.strokeWidth ? options.y + options.strokeWidth : options.y;
      let _w = options.strokeWidth ? options.dw - 2 * options.strokeWidth : options.dw;
      let _h = options.strokeWidth ? options.dh - 2 * options.strokeWidth : options.dh;
      //ctx.clip()

      ctx.drawImage(options.src, _x, _y, _w, _h);
    }
    else {
      //debugger
      ctx.drawImage(options.src, x - options.dw * 0.5, options.y, options.dw, options.dh);
    }
    ctx.restore()
  },

  drawText(ctx,options) {
    ctx.save();
    ctx.setFontSize(options.size);
    ctx.setFillStyle(options.fillStyle);
    ctx.setTextAlign(options.textAlign);
    ctx.fillText(options.text, options.x, options.y);
    ctx.restore();
  },

  /**
   * 绘制圆形
   */
  drawArc(ctx, options) {

  },

  drawMoreText(ctx, options) {

    var lineWidth = 0;
    var lastSubStrIndex = 0; //每次开始截取的字符串的索引

    let str = options.text;
    let initHeight = options.initHeight;
    let titleHeight = options.titleHeight;
    let maxWidth = options.w - options.gap * 2;
    let startX = options.x + options.gap;

    ctx.setFontSize(options.size);
    ctx.setFillStyle(options.fillStyle);

    for (let i = 0; i < str.length; i++) {

      lineWidth += ctx.measureText(str[i]).width;
      //console.log('lineWidth', lineWidth)
      if (lineWidth > maxWidth) {
        ctx.fillText(str.substring(lastSubStrIndex, i), startX, initHeight);//绘制截取部分
        initHeight += (options.size + options.gapHeight);//20为字体的高度
        lineWidth = 0;
        lastSubStrIndex = i;
        titleHeight += 60;
        //console.log('inner', lineWidth, lastSubStrIndex)
      }
      if (i == str.length - 1) {//绘制剩余部分
        ctx.fillText(str.substring(lastSubStrIndex, i + 1), startX, initHeight);
      }
    }
    // 标题border-bottom 线距顶部距离
    // titleHeight = titleHeight + 10;
    // return titleHeight;
  }

  
}

Sunrise.Component({
  /**
   * 组件的属性列表
   */
  properties: {
    
     canvasWidth: {
       type:Number,
       value:0
     },

     canvasHeight: {
       type:Number,
       value:0
     },

     hide:{
       type:Boolean,
       value:false
     },

     backgroupImage:String
     
  },

  /**
   * 组件的初始数据
   */
  data: {
    canvasX:0
  },

  /**
   * 组件的方法列表
   */
  methods: {

    init() {

      let canvasWidth = this.data.canvasWidth, 
          canvasHeight = this.data.canvasHeight;


      let windowHeight = Sunrise.sys.windowHeight;
      let windowWidth = Sunrise.sys.windowWidth;

    Bound.getBound('.canvas-container', r => {
        if(r) {


          if (!this.data.canvasWidth) {
            canvasWidth = r.width;
          }
          if (!this.data.canvasHeight) {
            canvasHeight = r.height || Sunrise.sys.windowHeight;
          }

          if (this.data.backgroupImage) {

            Sunrise.weapp.getImageInfo(this.data.backgroupImage).then(res => {

              //console.log('canvasWidth - res', res)
              let imageWidth = res.width,
                  imageHeight = res.height;

              let scale = canvasWidth / imageWidth;   

              let cw = imageWidth * scale;
              let ch = imageHeight * scale;

              //debugger
              this.setData({ canvasWidth: cw, canvasHeight: ch });

              this._doContext();
              //this._doTransform(imageWidth,imageHeight,canvasWidth, canvasHeight);
              this._drawBackgroupImage({
                src: '../../'+res.path,
                w: cw,
                h: ch
              })
            })
          }
          else {
            let canvasX = (r.width - canvasWidth) / 2;
            this.setData({ canvasWidth, canvasHeight, canvasX});
            this.triggerEvent('init'); 
          }
        }
    
      }, this);
      

    },

    _doContext() {
      if (!this.ctx) this.ctx = wx.createCanvasContext('srCanvas', this);
    },
    /**
     * Canvas 等比缩放
     */
    _doTransform(w, h, sw, sh) {
      let scale = sw / w;
      //this.ctx.scale(scale, scale);
      return this;
    },

    /**
     * 绘制背景图
     * 
     * 使用后将根据背景图大小更改 Canvas 大小，并进行等比缩放
     * 
     */
    _drawBackgroupImage(options) {
      options = _.apply({
        x: 0,
        y: 0
      }, options || {});
      this.ctx.drawImage(options.src, options.x, options.y, options.w, options.h);
      this.ctx.draw(false,() => {
        this.triggerEvent('init');
      }); 
    },

    getHeightByRatio(ratio) {
      return this.data.canvasHeight * ratio;
    },

    start(options) {
      options = _.apply({
        size: 30,
        fillStyle: '#FFF',
        textAlign: 'center'
      }, options || {});
      this._options = options;
      this._drawQueue = [];

      wx.showLoading({
        title: '生成中...',
      });

      return this;
    },

    end(callback) {
      if (!this._drawQueue) {
        throw new Error('_drawQueue is not Empty. pleace do start method');
      }

      this._doContext();
      Promise.all(this._drawQueue).then(list => {
        list.forEach(options => {
          this._draw(options);
        })
        this.ctx.draw(true, () => {
          if (_.isFunction(callback) ) {
            setTimeout( () => {
              callback();
              wx.hideLoading();
            },200)
          }
          else {
            wx.hideLoading();
          }
        });
      });
      return this;
    },

    _draw(options) {

      switch (options.type) {
        case 'text' : {
          DrawUtil.drawText(this.ctx,options);
          break;
        }
        case 'more_text': {
          DrawUtil.drawMoreText(this.ctx, options);
          break;
        }
        case 'image': {
          DrawUtil.drawImage(this.ctx,options);
          break;
        }
      }
    },


    saveToPhotos() {
      return Sunrise.weapp.saveCanvas('srCanvas',this);
    },

    drawText(options) {
      options = _.apply({
        size: 14,
        fillStyle: '#FFF',
        textAlign: 'center',
        text: 'Sunrise',
        x: 0,
        y: 30,
      }, options || {});
      options.type = 'text';

      if (options.textAlign == 'center') {
        options.x = this.data.canvasWidth * 0.5;
      }

      this._drawQueue.push(new Promise((resolve, reject) => {
        resolve(options);
      }));
      return this;
    },

    drawMoreText(options) {
      options = _.apply({
        size:13,
        fillStyle: '#FFF',
        text: 'Sunrise',
        initHeight : 50,
        gapHeight: 10,
        titleHeight: 50,
        gap:10,
        w: this.data.canvasWidth,
        x: 0,
        y: 0,
      }, options || {});
      options.type = 'more_text';
      
      this._drawQueue.push(new Promise((resolve, reject) => {
        resolve(options);
      }));
      return this;
    },

    drawImage(options) {
      options = _.apply({
        mode:'rect',
        align:'center',
        cw: this.data.canvasWidth,
        strokeStyle:'#fff',
        strokeWidth: 0,
        isLocal:true,
        //fillStyle: '#000',
        x: 0,
        y: 0,
        w: 0,
        h: 0
      }, options || {});
      options.type = 'image';

      function getRect(sw,sh,w,h) {
        let tPre = w / h, sPre = sw / sh;
        let dw = w, dh = h;
        if (sPre <= tPre) {
          dh = sh * w / sw;
        }
        else {
          dw = sw * h / sh;
        }
        return {sw:sw,sh:sh,dw:dw,dh:dh}
      }

      this._drawQueue.push(new Promise((resolve, reject) => {
        let src = options.src;
        if (src.startsWith('http')) {
          Sunrise.weapp.downloadFile(src).then(file => {
            options.src = file.tempFilePath;
            Sunrise.weapp.getImageInfo(options.src).then(res => {
              !options.w && (options.w = res.width)
              !options.h && (options.h = res.height)
              options = _.apply(options, getRect(res.width, res.height, options.w, options.h));
              resolve(options);
            })
          })
        }
        else {
          Sunrise.weapp.getImageInfo(options.src).then(res => {
            !options.w && (options.w = res.width)
            !options.h && (options.h = res.height)
            options = _.apply(options, getRect(res.width, res.height, options.w, options.h));
            options.src = src.startsWith('wxfile://') ? res.path : '../../' + res.path;
            resolve(options);
          })
        }
      }));
      return this;
    },

    getCanvs() {
      return wx.createCanvasContext('srCanvas', this);
    },
  }
})
