const he = require('./helper')
const bm = require('./burses/bitmart')
const gi = require('./burses/gateio')
const me = require('./burses/mexc')
const BursesComparator = require('./BursesPriceComparator')
const PairsDepthComparator = require('./PairsDepthComparator')

pairsToCompare = new Array("CFX_USDT", "KABY_USDT");

timeout = new he(onTimeout)

var burses = []; 
burses.push(new bm())
burses.push(new gi())
burses.push(new me())

//  burses[0].getDepth("CFX_USDT").then(res => {
//    console.log(res)
//  })
// burses[1].getDepth("CFX_USDT").then(res => {
//   console.log(res)
// })
// burses[2].getDepth("CFX_USDT").then(res => {
//   console.log(res)
// })

tickersComparefinishedCallback = function(priceDifferences) {
  printDifferences(priceDifferences)
}
pairsComparefinishedCallback = function(compare) {
  console.log(compare)
}

bc = new BursesComparator(burses, tickersComparefinishedCallback);
pc = new PairsDepthComparator(burses, pairsComparefinishedCallback)


function printDifferences(priceDifferences) {
  var diffs = new Array()
  for(const diff of priceDifferences)
  {
      //console.log(diff)
      if(diff.diff > 1 && diff.diff < 50)
      {
          //console.log(diff.pair + " " + diff.highest + " " + diff.lowest + " " + diff.diff )
          diffs.push(diff)
      }
  }
  pc.compare(diffs)
}

timeout.timeoutAfter(10)
bc.compare()
function onTimeout() {
 // bc.compare(pairsToCompare)
}
