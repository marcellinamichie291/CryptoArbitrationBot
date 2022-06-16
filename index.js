const he = require('./helper')
const bm = require('./burses/bitmart')
const gi = require('./burses/gateio')
const me = require('./burses/mexc')
const BursesComparator = require('./BursesPriceComparator')

timeout = new he(runFunc)

var burses = []; 
burses.push(new bm())
burses.push(new gi())
burses.push(new me())

timeout.timeoutAfter(10);

bc = new BursesComparator(burses);

function runFunc() {
  bc.compare();
}


//helper.timeoutAfter(1)