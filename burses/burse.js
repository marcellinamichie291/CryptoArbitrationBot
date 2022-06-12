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
  
    parsePairs() {
      throw new Error("Method 'say()' must be implemented.");
    }
  }

  module.exports = Burse // 👈 Export class