const he = require('./helper')
const bm = require('./burses/bitmart')
const gi = require('./burses/gateio')
const me = require('./burses/mexc')
const fse = require('fs-extra');
const BursesComparator = require('./BursesPriceComparator')
const PairsDepthComparator = require('./PairsDepthComparator')

pairsToCompare = new Array("CFX_USDT", "KABY_USDT");

timeout = new he(onTimeout)

var burses = []; 
burses.push(new bm())
burses.push(new gi())
burses.push(new me())

tickersComparefinishedCallback = async function(priceDifferences) {
  console.log("GET TICKERS DIFFERENCES FINISHED SUCCESSFUL")
  var diffs = new Array()
  for(const diff of priceDifferences)
  {
      if(diff.diff > 0.8 && diff.diff < 50)
      {
        var highestCurrencyInfo
        var lowestCurrencyInfo
        var skipThePair
        for(const burse of burses)
        {
          skipThePair = false
          if(burse.constructor.name === diff.highest)
          {
            try {
              highestCurrencyInfo = await burse.getCurrencyInfo(diff.pair)  
            } catch (error) {skipThePair = true; break}
          }

          if(burse.constructor.name === diff.lowest)
          {
            try {
              lowestCurrencyInfo = await burse.getCurrencyInfo(diff.pair) 
              break
            } catch (error) {skipThePair = true; break}
          }
        }

        if(skipThePair === true)
        {
          continue
        }

        if(highestCurrencyInfo.chain === "BEP20" || highestCurrencyInfo.chain === "BSC" && highestCurrencyInfo.deposit && 
        lowestCurrencyInfo.chain === "BEP20" || lowestCurrencyInfo.chain === "BSC" && lowestCurrencyInfo.withdraw)
        {
          diffs.push(diff)
        }
      }
  }
  console.log("GET DEPTH OF MARKETS")
  pc.compare(diffs)
}

pairsComparefinishedCallback = function(compare) {
  console.log("\nGET DEPTH OF MARKETS FINISHED SUCCESSFUL")

  var output = ""
  for(const pair of compare)
  {
    if(pair.buys.length > 0 && pair.sells.length > 0)
    {
        var diff = 100-((pair.buys[0].price / pair.sells[0].price)*100)
        if(diff > 2 && diff < 100)
        {
          
          output += "*********************************************************************************************\n"
          output += "BUY AT: " + pair.buyBurse + " FOR: " + pair.buys[0].price + " AMOUNT: " + pair.buys[0].amount + "\n"
          output += "SELL AT: " + pair.sellBurse + " FOR: " + pair.sells[0].price + " AMOUNT: " + pair.sells[0].amount + "\n"
          var sellFor = pair.sells[0].amount * pair.sells[0].price
          var buyMax = Math.min(pair.sells[0].amount, pair.buys[0].amount)
          output += "YOU CAN SELL FOR: " + sellFor + "$ MAX BUY: " + buyMax + "\n"
          output += "DEPTH DIFFERENCE FOR: "  + pair.pair + " IS " + diff + "\n"
          output += "*********************************************************************************************\n"

          console.log("*********************************************************************************************")
          console.log("BUY AT: " + pair.buyBurse + " FOR: " + pair.buys[0].price + " AMOUNT: " + pair.buys[0].amount)
          console.log("SELL AT: " + pair.sellBurse + " FOR: " + pair.sells[0].price + " AMOUNT: " + pair.sells[0].amount)
          sellFor = pair.sells[0].amount * pair.sells[0].price
          buyMax = Math.min(pair.sells[0].amount, pair.buys[0].amount)
          console.log("YOU CAN SELL FOR: " + sellFor + "$ MAX BUY: " + buyMax)
          console.log("DEPTH DIFFERENCE FOR: "  + pair.pair + " IS " + diff)
          console.log("*********************************************************************************************")
        }
    }
  }
  fse.writeFileSync('./diffs.log', output);
}

function printProgress(progress) {
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
  process.stdout.write(progress)
}

pairsCompareProgressCallback = function(progress) {
  //printProgress("DEPTH PROGRESS: " + progress)
  console.log(progress)
}

bc = new BursesComparator(burses, tickersComparefinishedCallback);
pc = new PairsDepthComparator(burses, pairsComparefinishedCallback, pairsCompareProgressCallback)

timeout.timeoutAfter(60*5)
console.log("GET TICKERS DIFFERENCES")
bc.compare()

function onTimeout() {
  console.log("GET TICKERS DIFFERENCES")
  bc.compare()
}
