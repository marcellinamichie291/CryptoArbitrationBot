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

tickersComparefinishedCallback = function(priceDifferences) {
  printDifferences(priceDifferences)
}

pairsComparefinishedCallback = function(compare) {
  for(const pair of compare)
  {
    if(pair.buys.length > 0 && pair.sells.length > 0)
    {
        var diff = 100-((pair.buys[0].price / pair.sells[0].price)*100)
        if(diff > 2 && diff < 100)
        {
            console.log("*********************************************************************************************")
            console.log("BUY AT: " + pair.buyBurse + " FOR: " + pair.buys[0].price + " AMOUNT: " + pair.buys[0].amount)
            console.log("SELL AT: " + pair.sellBurse + " FOR: " + pair.sells[0].price + " AMOUNT: " + pair.sells[0].amount)
            const sellFor = pair.sells[0].amount * pair.sells[0].price
            const buyMax = Math.min(pair.sells[0].amount, pair.buys[0].amount)
            console.log("YOU CAN SELL FOR: " + sellFor + "$ MAX BUY: " + buyMax)
            console.log("DEPTH DIFFERENCE FOR: "  + pair.pair + " IS " + diff)
            console.log("*********************************************************************************************")
        }
    }
  }
}

bc = new BursesComparator(burses, tickersComparefinishedCallback);
pc = new PairsDepthComparator(burses, pairsComparefinishedCallback)


function printDifferences(priceDifferences) {
  var diffs = new Array()
  for(const diff of priceDifferences)
  {
      //console.log(diff)
      if(diff.diff > 0.5 && diff.diff < 50)
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
