    class Helper {
  
    waitUntil(hour, minute, second, callback) {
      var now = new Date();
      var millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, second, 0) - now;
      if (millisTill10 < 0) {
          millisTill10 += 86400000; // it's after 10am, try 10am tomorrow.
      }
      setTimeout(callback, millisTill10);
    }
  
    timeoutAfter(seconds, callback, param1) {
      var the_interval = seconds * 1000;
      setInterval(callback, the_interval, param1);
    }

    printProgress(progress) {
      process.stdout.clearLine()
      process.stdout.cursorTo(0)
      process.stdout.write(progress)
    }
  }

  module.exports = Helper // 👈 Export class