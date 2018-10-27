
import dateUtil from './date.js'

module.exports = function (Sunrise) {


  const LEVEL_MAP = {
    'info': { m: 'info', vs: ['%c INFO', 'color:#0be941']} ,
    'error': { m: 'error', vs: ['%c ERROR', 'color:red'] },
    'debug': { m: 'debug', vs: ['%c DEBUG', 'color:#f700fe'] },
    'iao': { m: 'debug', vs: ['%c IAO', 'color:#04d1fa'] },
  }
  const getHeader = (vs,level) => {
    let strHeader = ['%c [Sunrise ', dateUtil.now(), '] ', vs[0]].join('');
    let styles = [];
    Sunrise.sys.isTooler ? (styles = ['color:#1728ff', vs[1]]) : (strHeader = strHeader.replace(/\%c/g, ''));
    return [strHeader].concat(styles)
  }

  const Logger = function() {
    this.style = [];
  };

  Logger.prototype.print = function (info,args) {
    let v = LEVEL_MAP[info];
    args = getHeader(v.vs,info).concat(Array.prototype.slice.call(args));
    Sunrise.sys.isTooler ? console.log.apply(this, args) : 
                           console[v.m].apply(this, args)
  }

  // Logger.prototype.setStyle = function () {
  //   this.styles = this.styles.concat(Array.prototype.slice.call(arguments));
  //   return this;
  // }

  Logger.prototype.info = function() {
    this.print('info', arguments);
  }

  Logger.prototype.error = function () {
    this.print('error', arguments);
  }

  Logger.prototype.debug = function () {
    this.print('debug', arguments);
  }

  Logger.prototype.iao = function () {
    this.print('iao', arguments);
  }

  return new Logger();

}