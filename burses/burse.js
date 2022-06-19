/**
 * Abstract Class Burse.
 *
 * @class Burse
 */
 class Burse {
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

    getDepth(pair) {
      
    }
  }

  module.exports = Burse // 👈 Export class