const he = require('./helper')
const fse = require('fs-extra');
const BursesComparator = require('./BursesPriceComparator')
const PairsDepthComparator = require('./PairsDepthComparator');
const logger = require('./logger');


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
        this.bc = new BursesComparator(this.burses);
        //this.helper.timeoutAfter(1, this.runTimerTick)
        //this.helper.timeoutAfter(60, this.onRefreshCurrenciesState, this)
        setTimeout(this.onRefreshCurrenciesState, 1000, this);

        // this.burses[0].getCurrencyInfo("$HERO").then( res => {
        //   logger.verbose(JSON.stringify(res))
        //   }).catch(e => {
        //       console.error(e)
        //   })

        //   this.burses[0].getDepth("$HERO").then( res => {
        //     logger.verbose(JSON.stringify(res))
        //     }).catch(e => {
        //         console.error(e)
        //     })
    }     

    runTimerTick() {

    }

    async computeDiffs(res, instance)
    {
      var diffs = new Array()
      for(var diff of res)
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
                  await burse.getCurrencyInfo(diff.pair)
                    .then(res => highestCurrencyInfo=res)
                    .catch(err => skipThePair = true)
                  if(skipThePair === true)
                    break;
              }
    
              if(burse.constructor.name === diff.lowest)
              {
                  await burse.getCurrencyInfo(diff.pair)
                    .then( res => lowestCurrencyInfo=res)
                    .catch(err => skipThePair = true)
                  if(skipThePair === true)
                    break;
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
      logger.verbose("GET TICKERS DIFFERENCES FINISHED SUCCESSFUL")
      logger.verbose("GET DEPTH OF MARKETS")

      instance.pc.compare(diffs)
  }

    async onRefreshCurrenciesState(instance) {

        logger.verbose("REFRESH TICKERS")
        for(const burse of instance.burses)
        {
          //if("Bitmart" === burse.constructor.name)
          //for(const curr of await burse.onRefreshCurrenciesTick())
          //  console.log(curr)
          await burse.onRefreshCurrenciesTick()
        }
        logger.verbose("REFRESH TICKERS FINISHED")
        logger.verbose("GET TICKERS DIFFERENCES")
        instance.bc.compare().then(res => instance.computeDiffs(res, instance))
    }
      
    pairsComparefinishedCallback(compare, instance) {
        logger.verbose("\nGET DEPTH OF MARKETS FINISHED SUCCESSFUL")
      
        var output = ""
        for(const pair of compare)
        {
          if(pair.buys.length > 0 && pair.sells.length > 0)
          {
              var buyMax = Math.min(pair.sells[0].amount, pair.buys[0].amount)
              var sellFor = buyMax * pair.sells[0].price
              var buyFor = buyMax * pair.buys[0].price
              var profit = sellFor - buyFor
              var fee = pair.buys[0].price*pair.withdraw_fee + ((buyFor/100)*10)

              if(fee >= profit)
              {
                logger.verbose("SKIP: " + pair.pair + " PROFIT: " + profit + "$ FEE: " + fee + "$ POTENTIAL: " + (profit - fee) + "$")
                continue
              }
                    
              var diff = 100-((pair.buys[0].price / pair.sells[0].price)*100)
              if(diff > 2 && diff < 100)
              {
                
                output += "*********************************************************************************************\n"
                output += "BUY AT: " + pair.buyBurse + " FOR: " + pair.buys[0].price + " AMOUNT: " + pair.buys[0].amount + "\n"
                output += "SELL AT: " + pair.sellBurse + " FOR: " + pair.sells[0].price + " AMOUNT: " + pair.sells[0].amount + "\n"
                output += "BUY FOR: " + buyFor + "$ MAX BUY: " + buyMax + "\n"
                output += "SELL FOR: " + sellFor + "$ MAX BUY: " + buyMax + "\n"
                output += "DEPTH DIFFERENCE FOR: "  + pair.pair + " IS " + diff + " PROFIT POTENTIAL: " + profit + "$\n"
                output += "*********************************************************************************************\n"
      
                // logger.verbose("*********************************************************************************************")
                // logger.verbose("BUY AT: " + pair.buyBurse + " FOR: " + pair.buys[0].price + " AMOUNT: " + pair.buys[0].amount)
                // logger.verbose("SELL AT: " + pair.sellBurse + " FOR: " + pair.sells[0].price + " AMOUNT: " + pair.sells[0].amount)
                // sellFor = pair.sells[0].amount * pair.sells[0].price
                // buyMax = Math.min(pair.sells[0].amount, pair.buys[0].amount)
                // logger.verbose("YOU CAN SELL FOR: " + sellFor + "$ MAX BUY: " + buyMax)
                // logger.verbose("DEPTH DIFFERENCE FOR: "  + pair.pair + " IS " + diff)
                // logger.verbose("*********************************************************************************************")
              }
          }
        }
        logger.info(output)
        fse.writeFileSync('./diffs.log', output);

        setTimeout(instance.onRefreshCurrenciesState, 1000, instance);
    }
      
      pairsCompareProgressCallback(progress, instance) {
        //printProgress("DEPTH PROGRESS: " + progress)
        console.log(progress)
      }
}

module.exports = TradeSimulator // 👈 Export class