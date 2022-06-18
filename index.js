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

priceDifferences = new Array()
tickersComparefinishedCallback = function(pairsArray) {
  for(var pair of pairsArray)
  {
      if(pair.burses.length < 2)
          continue
      
      var lowestBurse, lowestPrice = Math.floor(Number.MAX_SAFE_INTEGER)
      var highestBurse, highestPrice = Math.floor(Number.MIN_SAFE_INTEGER)
      for(const burse of pair.burses)
      {
          if(lowestPrice > burse.price)
          {
              lowestBurse = burse.burse
              lowestPrice = burse.price
          }
          if(highestPrice < burse.price)
          {
              highestBurse = burse.burse
              highestPrice = burse.price
          }
      }
      var diff = 100-((lowestPrice / highestPrice)*100)
      priceDifferences.push({pair: pair.pair, highest: highestBurse, lowest: lowestBurse, diff: diff})
  }

   // sort by deifference
  priceDifferences.sort((a, b) => b.diff - a.diff)
  //console.dir(this.priceDifferences)

  for(const diff of this.priceDifferences)
  {
      if(diff.diff > 1 && diff.diff < 50)
          console.log(diff.pair + " " + diff.highest + " " + diff.lowest + " " + diff.diff )
  }
}

bc = new BursesComparator(burses, tickersComparefinishedCallback);

function runFunc() {
  bc.compare();
}

//helper.timeoutAfter(1)