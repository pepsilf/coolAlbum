

import _ from '../attr.js';
import cache from '../cache.js';



class Processor {

  constructor(...processors) {
    this.processors = processors || [];
    this.processorLen = processors.length;
    this.processorIndex = this.processorLen ? 0 : -1;
    this.currProcessor = null;
    this.resQueue = [];

    if (!processors.length) {
      throw new Error("Processors is not empty.");
    }
  }


  rollbackProcessor(res) {

    if (this.processors.length) {

      this.currProcessor = this.processors.shift();
      this.currProcessor.then(this.endProcessor.bind(this));

      this.currProcessor.chainProcessor = this;

      /**
       * 上一次链路的请求结果
       */
      // this.currProcessor.preRes = preRes;
      // this.currProcessor.do(res);
    }
    else {
      this.endAll(res);
    }
  }

  endProcessor(res) {

    //sLogger.debug("processorChain end ", this.processorIndex, res);

    this.resQueue[this.processorIndex] = res;
    this.processorIndex++;
    this.rollbackProcessor(res);
  }

  start() {


    
  }



}


module.exports = Processor