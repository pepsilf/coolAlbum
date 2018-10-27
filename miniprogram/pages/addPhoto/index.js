const Sunrise = getApp().sunrise;

//获取数据库
const db = wx.cloud.database()

Sunrise.Page({

  data: {
    //心情
    feeling: '',
    //照片
    images: [],
    //字数
    num: 0,
    //字数
    num: 0,
    //所有相册类型
    photoTypes:[],
    //相册类型id
    typeId:1
  },

  //初始化
  init() {
    db.collection('photoTypes').get({
      success:res=> {
        console.log(res)
        this.setData({
          photoTypes:res.data
        })
      }
    })
  },

  //输入事件
  onInput(e) {
    let value = e.detail.value
    let length = e.detail.value.length
    if (length > 100) {
      wx.showToast({
        title: '最多输入100个字',
        icon: 'none'
      })
      this.setData({
        feeling: this.data.feeling
      })
      return
    }
    this.setData({
      num: length,
      feeling: value
    })
  },

  //增加或移除图片
  onImageChange(e) {
    this.setData({
      images: e.detail
    })
  },

  //选择相册类型
  choseType(e){
    this.setData({
      typeId: e.currentTarget.dataset.typeid
    })
  },

  //发表
  submit() {
    if (value.trim() == '') value = ''
    if (this.data.images.length) {
      this.selectComponent('#images').upload(res => {
        let photos = res.map(val => {
          return {
            mimeType: 0,
            photoUrl: val
          }
        })
        let tempArr = []
        for (let i in photos) {
          tempArr.push({
            imageUrl: photos[i].photoUrl
          })
        }
        let model = {
          depict: this.data.feeling,
          commissionStallImagesRequestList: tempArr
        }
        wx: wx.navigateBack({
          delta: 1,
        })
      }, err => {
        wx.showToast({
          title: '上传失败，请稍后重试',
          icon: 'none'
        })
      })
    } else {
      wx.showToast({
        title: '图片资料不能为空',
        icon: 'none'
      })
    }
  }
});