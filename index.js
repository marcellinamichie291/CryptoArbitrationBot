const he = require('./helper')
const bm = require('./burses/bitmart')
const gi = require('./burses/gateio')
const me = require('./burses/mexc')
const BursesComparator = require('./bursesPrieceComparator')

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

var burses = []; 
burses.push(new bm())
burses.push(new gi())
burses.push(new me())

bc = new BursesComparator(burses);
bc.compare();

function runFunc() {
  console.log("FUNC")
}

helper = new he(runFunc)
//helper.timeoutAfter(1)