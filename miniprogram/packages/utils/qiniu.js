(function () {

  var config = {
    qiniuRegion: 'SCN',
    qiniuVideoURLPrefix: 'https://video.cnhnb.com/transcode',
    qiniuImageURLPrefix: 'https://image.cnhnb.com',
    qiniuUploadId: '',
    qiniuUploadKey: '',
    qiniuUploadToken: '',
    qiniuUploadTokenURL: 'https://gateway.cnhnkj.cn/monk/file/storage/v1/getUploadTokenForWeb',
    //qiniuUploadTokenURL: 'https://truffle.cnhnkj.cn/banana/public/query/qiniu/token',
    //http://10.10.8.202:7776/file/storage/v1/getUploadTokenForWeb
    qiniuUploadTokenFunction: null,
    qiniuShouldUseQiniuFileName: false
  }

  const VIDEO_EXTS = ["mp3", "mp4"];

  module.exports = {
    init: init,
    upload: upload,
  }

  // 在整个程序生命周期中，只需要 init 一次即可
  // 如果需要变更参数，再调用 init 即可
  function init(options) {
    config = {
      qiniuRegion: '',
      qiniuImageURLPrefix: '',
      qiniuVideoURLPrefix: '',
      qiniuUploadToken: '',
      qiniuUploadTokenURL: '',
      qiniuUploadTokenFunction: null,
      qiniuShouldUseQiniuFileName: false
    };
    updateConfigWithOptions(options);
  }

  function updateConfigWithOptions(options) {
    if (options.region) {
      config.qiniuRegion = options.region;
    }
    if (options.uptoken) {
      config.qiniuUploadToken = options.uptoken;
    } else if (options.uptokenURL) {
      config.qiniuUploadTokenURL = options.uptokenURL;
    } else if (options.uptokenFunc) {
      config.qiniuUploadTokenFunction = options.uptokenFunc;
    }
    if (options.domain) {
      config.qiniuImageURLPrefix = options.domain;
    }
    config.qiniuShouldUseQiniuFileName = options.shouldUseQiniuFileName
  }


  function upload(filePath, success, fail, options, progress, cancelTask) {
    if (null == filePath) {
      console.error('qiniu uploader need filePath to upload');
      return;
    }
    if (options) {
      updateConfigWithOptions(options);
    }

    if (config.qiniuUploadTokenURL) {
      getQiniuToken(function () {
        doUpload(filePath, success, fail, options, progress, cancelTask);
      }, filePath);
    } else if (config.qiniuUploadTokenFunction) {
      config.qiniuUploadToken = config.qiniuUploadTokenFunction();
      if (null == config.qiniuUploadToken && config.qiniuUploadToken.length > 0) {
        console.error('qiniu UploadTokenFunction result is null, please check the return value');
        return
      }
      doUpload(filePath, success, fail, options, progress, cancelTask);
    } else {
      console.error('qiniu uploader need one of [uptoken, uptokenURL, uptokenFunc]');
      return;
    }
  }

  function getKey() {
    var d = new Date().getTime()
    var _key = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (
      c
    ) {
      var r = ((d + Math.random() * 16) % 16) | 0
      d = Math.floor(d / 16)
      return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
    return _key;
  }

  function getFileExt(filePath) {
    var fileNames = filePath.split('.');
    return fileNames[fileNames.length - 1];
  }

  function getURLPrefix(ext) {
    var fileType = getFileType(ext);
    if (fileType === 1) {
      return config.qiniuVideoURLPrefix;
    }
    return config.qiniuImageURLPrefix;
  }

  function getFileType(ext) {
    if (VIDEO_EXTS.indexOf(ext.toLowerCase()) != -1) {
      return 1;
    }
    return 0;
  }

  function doUpload(filePath, success, fail, options, progress, cancelTask) {
    if (null == config.qiniuUploadToken && config.qiniuUploadToken.length > 0) {
      console.error('qiniu UploadToken is null, please check the init config or networking');
      return
    }
    var url = uploadURLFromRegionCode(config.qiniuRegion);

    var fnameExt = getFileExt(filePath);


    var formData = {
      'token': config.qiniuUploadToken,
      'x:id': config.qiniuUploadId,
      'key': config.qiniuUploadKey
    };
    if (!formData.key) {
      formData['key'] = options.key || getKey()
    }

    console.log("qiniu FormData", formData);

    var urlPrefix = getURLPrefix(fnameExt);
    var fileType = getFileType(fnameExt);
    var uploadTask = wx.uploadFile({
      url: url,
      filePath: filePath,
      name: 'file',
      formData: formData,
      success: function (res) {

        console.log("qiniu:", res);

        var results = {};
        if (typeof (res.data) === 'string') {
          try {
            results = JSON.parse(res.data);
          } catch (e) {
            console.log('parse JSON failed, origin String is: ' + res.data)
            if (fail) {
              fail(e);
            }
          }
        }

        if (!results.code) {
          var dataObject = {
            type: fileType,
            src: urlPrefix + '/' + formData.key
          };

          console.log(dataObject);
          if (success) {
            success(dataObject);
          }
        }
      },
      fail: function (error) {
        console.error(error);
        if (fail) {
          fail(error);
        }
      }
    })

    uploadTask.onProgressUpdate((res) => {
      progress && progress(res)
    })

    cancelTask && cancelTask(() => {
      uploadTask.abort()
    })
  }

  function getQiniuToken(callback, filePath) {

    var fnameExt = getFileExt(filePath);;
    wx.request({
      url: config.qiniuUploadTokenURL,
      data: {
        fname: ["*", fnameExt].join("."),
        submitType: 0,
        busType: 6
      },
      method: "POST",
      header: {
        'content-type': 'application/json',
        'accept': '*/*'
      },
      success: function (res) {
        var result = res.data.data ? res.data.data : res.data;

        console.log("qiniu Token:", result);
        if (result.token && result.token.length > 0) {
          config.qiniuUploadToken = result.token;
          config.qiniuUploadKey = result.key;
          config.qiniuUploadId = result.id;
          if (callback) {
            callback();
          }
        } else {
          console.error('qiniuUploader cannot get your token, please check the uptokenURL or server')
        }
      },
      fail: function (error) {
        console.error('qiniu UploadToken is null, please check the init config or networking: ' + error);
      }
    })
  }

  function uploadURLFromRegionCode(code) {
    // var uploadURL = null;
    // switch (code) { 
    //   //http://upload-z2.qiniup.com
    //   case 'ECN': uploadURL = 'https://up.qbox.me'; break;
    //   case 'NCN': uploadURL = 'https://up-z1.qbox.me'; break;
    //   case 'SCN': uploadURL = 'https://up-z2.qbox.me'; break;
    //   case 'NA': uploadURL = 'https://up-na0.qbox.me'; break;
    //   case 'ASG': uploadURL = 'https://up-as0.qbox.me'; break;
    //   default: console.error('please make the region is with one of [ECN, SCN, NCN, NA, ASG]');
    // }
    // return uploadURL;
    return 'https://up-z2.qbox.me';
  }

})();