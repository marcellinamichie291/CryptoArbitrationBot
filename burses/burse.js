const he = require('../helper')
require('dotenv').config();

/**
 * Abstract Class Burse.
 *
 * @class Burse
 */
 class Burse {
    

    pairs = new Array()
    prices = new Array()

    currencies = new Array()

    constructor() {
      if (this.constructor == Burse) {
        throw new Error("Abstract classes can't be instantiated.");
      }

      // this.onRefreshCurrenciesTick()
      // this.helper = new he()
      // this.helper.timeoutAfter(10, this.onRefreshCurrenciesTick)
    }

    getKey(){
      throw new Error("Method 'getKey()' must be implemented.");
    }

    getSecret(){
      throw new Error("Method 'getSecret()' must be implemented.");
    }

    getTickers() {
      throw new Error("Method 'getTickers()' must be implemented.");
    }

    getTickersTimeoutInterval() {
      throw new Error("Method 'getTickersTimeoutInterval()' must be implemented.");
    }

    getDepth(pair, precision = 6) {
      throw new Error("Method 'getDepth()' must be implemented.");
    }

    onRefreshCurrenciesTick() {
      throw new Error("Method 'onRefreshCurrenciesTick()' must be implemented.");
    }

    parseChainName(chain)
    {
        if(chain.includes("BEP20") || chain.includes("BEP"))
            return "BEP20"
        else if(chain.includes("BSC"))
            return "BSC"
        throw "UNKNOWN CHAIN"
    }

    getCurrencyInfo(pair)
    {
      return new Promise((reso, err) => {
          if(pair.includes("_USDT") === false)
              err("PAIR DOES NOT CONTAINS _USD")
          pair = pair.replace("_USDT", "")
          
          for(const currency of this.currencies)
          {
              if(currency.currency === pair)
              {
                if(currency.currency === "DVDX_USDT")
                {
                  var ddwad = {}
                  console.log(currency)
                  console.log("IN")
                }

                  reso(currency)
              }
          }
          err("CANT FIND " + pair)
      })
  }
}

  module.exports = Burse // 👈 Export class