const he = require('../helper')

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

      this.onRefreshCurrenciesTick()
      this.refreshCurrenciesTimer = new he(this.onRefreshCurrenciesTick)
      this.refreshCurrenciesTimer.timeoutAfter(10)
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

    getCurrencyInfo(pair) {
      throw new Error("Method 'getCurrencyInfo()' must be implemented.");
    }
  }

  module.exports = Burse // 👈 Export class