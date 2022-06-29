const he = require('./helper')
const fse = require('fs-extra');
const BursesComparator = require('./BursesPriceComparator')
const PairsDepthComparator = require('./PairsDepthComparator')


class TradeSimulator {

    currentAnualUsdt = 100.0
    investedAnualUsdt = 0.0

    constructor(burses)   
    {
        this.burses = burses
        this.helper = new he()
        const memeberCallbackFinished = { function:this.pairsComparefinishedCallback, 
                                  functionContext: this }
        const memeberCallbackProgress = { function:this.pairsCompareProgressCallback, 
                                   functionContext: this }
        this.pc = new PairsDepthComparator(this.burses, memeberCallbackFinished, memeberCallbackProgress)
        this.bc = new BursesComparator(this.burses, this.tickersComparefinishedCallback, this);
        //this.helper.timeoutAfter(1, this.runTimerTick)
        //this.helper.timeoutAfter(60, this.onRefreshCurrenciesState, this)
        setTimeout(this.onRefreshCurrenciesState, 1000, this);

        // this.burses[0].getCurrencyInfo("$HERO").then( res => {
        //   console.log(res)
        //   }).catch(e => {
        //       console.error(e)
        //   })

        //   this.burses[0].getDepth("$HERO").then( res => {
        //     console.log(res)
        //     }).catch(e => {
        //         console.error(e)
        //     })
    }     

    runTimerTick() {

    }

    async computeDiffs(res, instance)
    {
      var diffs = new Array()
      for(const diff of res)
      {
          if(diff.diff > 0.8 && diff.diff < 50)
          {
            var highestCurrencyInfo
            var lowestCurrencyInfo
            var skipThePair
            for(const burse of instance.burses)
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
    
            if(highestCurrencyInfo != undefined && highestCurrencyInfo.chain === "BEP20" || highestCurrencyInfo.chain === "BSC" && highestCurrencyInfo.deposit && 
            lowestCurrencyInfo != undefined && lowestCurrencyInfo.chain === "BEP20" || lowestCurrencyInfo.chain === "BSC" && lowestCurrencyInfo.withdraw)
            {
              diffs.push(diff)
            }
          }
      }
      console.log("GET TICKERS DIFFERENCES FINISHED SUCCESSFUL")
      console.log("GET DEPTH OF MARKETS")

      instance.pc.compare(diffs)
  }

    async onRefreshCurrenciesState(instance) {

        console.log("REFRESH TICKERS")
        for(const burse of instance.burses)
        {
          //if("Bitmart" === burse.constructor.name)
          //for(const curr of await burse.onRefreshCurrenciesTick())
          //  console.log(curr)
          await burse.onRefreshCurrenciesTick()
        }
        console.log("REFRESH TICKERS FINISHED")
        console.log("GET TICKERS DIFFERENCES")
        instance.bc.compare().then(res => instance.computeDiffs(res, instance))
    }
      
    pairsComparefinishedCallback(compare, instance) {
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
      
                // console.log("*********************************************************************************************")
                // console.log("BUY AT: " + pair.buyBurse + " FOR: " + pair.buys[0].price + " AMOUNT: " + pair.buys[0].amount)
                // console.log("SELL AT: " + pair.sellBurse + " FOR: " + pair.sells[0].price + " AMOUNT: " + pair.sells[0].amount)
                // sellFor = pair.sells[0].amount * pair.sells[0].price
                // buyMax = Math.min(pair.sells[0].amount, pair.buys[0].amount)
                // console.log("YOU CAN SELL FOR: " + sellFor + "$ MAX BUY: " + buyMax)
                // console.log("DEPTH DIFFERENCE FOR: "  + pair.pair + " IS " + diff)
                // console.log("*********************************************************************************************")
              }
          }
        }
        console.log(output)
        fse.writeFileSync('./diffs.log', output);

        setTimeout(instance.onRefreshCurrenciesState, 1000, instance);
    }
      
      pairsCompareProgressCallback(progress, instance) {
        //printProgress("DEPTH PROGRESS: " + progress)
        console.log(progress)
      }
}

module.exports = TradeSimulator // 👈 Export class