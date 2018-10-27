
import base64 from './base64.js';

function watermarkImage(image) {
  var images = [];
  images.push("image/" + (image || "aHR0cDovL29ya3VwdXEyeS5ia3QuY2xvdWRkbi5jb20vaW1hZ2UvcG5nL3dhdGVybWFyay5wbmc="));
  images.push("dissolve/50");
  images.push("gravity/SouthEast");
  images.push("dx/10");
  images.push("dy/10");
  images.push("ws/0.2");
  return images.join("/");
}

function watermarkText(text, fs, color) {
  var texts = [];
  texts.push("text/" + base64.encode(text.toString() || "--"));
  texts.push("font/5b6u6L2v6ZuF6buR");
  texts.push("fontsize/" + (fs || 800));
  texts.push("fill/" + base64.encode(color || "#FFFFFF"));
  texts.push("dissolve/50");
  texts.push("gravity/SouthWest");
  texts.push("dx/10");
  texts.push("dy/10");
  return texts.join("/");
}

module.exports = {
  
  handler: function (str,text,image) {
    if (str) {
      if (str.indexOf("group1") > -1) {
        str = str.replace("400x400", "400x400_1_1")
      } else {
        var imageWater = watermarkImage(image), s = null;
        if (text) {
          s = "|watermark/3/" + watermarkText(text) + "/" + imageWater;
        }
        else {
          s = "|watermark/1/" + watermarkImage(image);
        }
        var firstS = "?imageMogr2/auto-orient|";
        if (str.indexOf("?") < 0) {
          str += firstS + s;
        } else {
          str = str.replace("?", firstS) + s;
        }
        str = str.replace(/[|]{2}/gi, "|");
      }
    }
    return str || "";
  }
}