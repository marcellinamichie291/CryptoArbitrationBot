const he = require('./helper')
const bm = require('./burses/bitmart')
const gi = require('./burses/gateio')
const me = require('./burses/mexc')
const BursesComparator = require('./BursesPriceComparator')

pairsToCompare = new Array("CFX_USDT", "DOG_USDT");

timeout = new he(onTimeout)

var burses = []; 
burses.push(new bm())
burses.push(new gi())
burses.push(new me())

burses[0].getDepth("CFX_USDT").then(res => {
  console.log(res)
})
burses[1].getDepth("CFX_USDT").then(res => {
  console.log(res)
})
burses[2].getDepth("CFX_USDT").then(res => {
  console.log(res)
})

tickersComparefinishedCallback = function(priceDifferences) {
  printDifferences(priceDifferences)
}

function printDifferences(priceDifferences) {
  for(const diff of priceDifferences)
  {
      if(diff.diff > 1 && diff.diff < 50)
          console.log(diff.pair + " " + diff.highest + " " + diff.lowest + " " + diff.diff )
  }

}

bc = new BursesComparator(burses, tickersComparefinishedCallback);

timeout.timeoutAfter(1)

function onTimeout() {
  bc.compare(pairsToCompare)
}
