/**
 * Abstract Class Burse.
 *
 * @class Burse
 */
 class Burse {

    pairs = new Array();
    prices = new Array();

    constructor() {
      if (this.constructor == Burse) {
        throw new Error("Abstract classes can't be instantiated.");
      }
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
  }

  module.exports = Burse // 👈 Export class