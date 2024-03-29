const he = require('./helper')
const bm = require('./burses/bitmart')
const gi = require('./burses/gateio')
const me = require('./burses/mexc')
const ts = require('./TradeSimulator')
const TradeSimulator = require('./TradeSimulator')
const Helper = require('./helper')
const logger = require('./logger')
require('./logger')
//pairsToCompare = new Array("CFX_USDT", "KABY_USDT");

var burses = []; 
burses.push(new bm())
burses.push(new gi())
burses.push(new me())

for(const burse of burses)
{
   // burse.getCurrencyInfo("PSP_USDT").then(res => logger.verbose(burse.constructor.name + ": " + JSON.stringify(res)))
   // .then(res => logger.verbose(burse.constructor.name + ": " + JSON.stringify(res)))
   // .catch(err => logger.error(burse.constructor.name + ": " + JSON.stringify(err)))
    //burse.getWithdrawFee("FLOKI").then(res => logger.verbose(burse.constructor.name + ": " + JSON.stringify(res)))
}

//burses[0].getWithdrawFee("FLOKI").then(res => logger.verbose( JSON.stringify(res)))

// buy USD sell BTC
//burses[0].createOrder("BTC_USDT", false, "0.00049000").then(res => logger.verbose( JSON.stringify(res)))
//    .catch(err => logger.error( JSON.stringify(err)))

//                                        USD,  CURRENCY
//burses[1].createOrder("EMPIRE_USDT", true, "1200", "0.001").then(res => logger.verbose( JSON.stringify(res)))
//    .catch(err => logger.error( JSON.stringify(err)))

//                                        USD,  CURRENCY
//burses[2].createOrder("DVDX_USDT", true, "1190", "0.01").then(res => logger.verbose( JSON.stringify(res)))
//     .catch(err => logger.error( JSON.stringify(err)))

//           CURRENCY, AMOUNT, ADDR, MEMO 
//burses[0].withdraw("BTC", "0.0001", "", "").then(res => logger.verbose( JSON.stringify(res)))
//    .catch(err => logger.error( JSON.stringify(err)))

//                                        USD,  CURRENCY
//burses[1].withdraw("HERO", "0.0001", "", "").then(res => logger.verbose( JSON.stringify(res)))
//    .catch(err => logger.error( JSON.stringify(err)))

//                                        USD,  CURRENCY
//burses[2].withdraw("HERO", "0.0001", "", "").then(res => logger.verbose( JSON.stringify(res)))
//     .catch(err => logger.error( JSON.stringify(err)))

buy("VLXPAD_USDT", "Mexc", burses)

// burses[1].createOrder("CTT_USDT", false, "1.8789", "1.049624").then(res => logger.verbose( JSON.stringify(res)))
// .catch(err => {
//     logger.error(JSON.stringify(err))
//     throw "Failed to create Gateio order"
// })

async function buy(pair, burseName, burses)
{
    try
    {
        var selectedBurse
        for(const burse of burses)
        {
            if(burseName === burse.constructor.name)
            {
                selectedBurse = burse
                break
            }
        }

        var forUsd = 0;
        await selectedBurse.getBalance().then(res => {
            res.forEach(element => {
                if(element.currency === "USDT")
                forUsd = element.available
            });
        })
        .catch(err => {
            logger.error(JSON.stringify(err))
            throw "Failed to create Gateio order"
        })
        logger.verbose(forUsd + "USDT at " + selectedBurse.constructor.name)

        if(forUsd < 0.1)
        {
            //throw "Small amount of USDT"
        }

        if(burseName === "Bitmart")
        {
            var depth = {}
            await selectedBurse.getDepth(pair).then(res => depth = res)
                .catch(err => {
                    throw "FAILED TO GET DEPTH"
                })
            
            const usdForOrderAmount = depth.asks[0].price*depth.asks[0].amount
            const buyFor = Math.min(usdForOrderAmount,forUsd)
            logger.verbose("BUY: " + buyFor/depth.asks[0].price + " tokens for: " + buyFor + "$")
            // buy USD sell BTC
            await selectedBurse.createOrder(pair, true, buyFor).then(res => logger.verbose( JSON.stringify(res)))
                .catch(err => {
                    throw "Failed to create Bitmart order"
                })
        }
        else if(burseName === "Gateio")
        {
            var depth = {}
            await selectedBurse.getDepth(pair).then(res => depth = res)
                .catch(err => {
                    throw "FAILED TO GET DEPTH"
                })
            
            const usdForOrderAmount = depth.asks[0].price*depth.asks[0].amount
            const buyFor = Math.min(usdForOrderAmount,forUsd)
            const buyAmount = buyFor/depth.asks[0].price
            logger.verbose("BUY: " + buyFor/depth.asks[0].price + " tokens for: " + buyFor + "$")
            //                                        USD,  CURRENCY
            await selectedBurse.createOrder(pair, true, depth.asks[0].price, buyAmount).then(res => logger.verbose( JSON.stringify(res)))
                .catch(err => {
                    logger.error(JSON.stringify(err))
                    throw "Failed to create Gateio order"
                })
        }
        else if(burseName === "Mexc")
        {
            var depth = {}
            await selectedBurse.getDepth(pair).then(res => depth = res)
            .catch(err => {
                throw "FAILED TO GET DEPTH"
            })

            const usdForOrderAmount = depth.asks[0].price*depth.asks[0].amount
            const buyFor = Math.min(usdForOrderAmount,forUsd)
            const buyAmount = buyFor/depth.asks[0].price
            logger.verbose("BUY: " + buyFor/depth.asks[0].price + " tokens for: " + buyFor + "$")
            //                                        USD,  CURRENCY
            await selectedBurse.createOrder(pair, true, depth.asks[0].price, buyAmount).then(res => logger.verbose( JSON.stringify(res)))
                .catch(err => {
                    throw "Failed to create Mexc order Error: " + JSON.stringify(err)
                })
        }
        else
            throw "INVALID BURSE NAME"
    }
    catch(e)
    {
        console.error(e)
    }
}

async function sell(pair, burseName, burses)
{
    try
    {
        var selectedBurse
        for(const burse of burses)
        {
            if(burseName === burse.constructor.name)
            {
                selectedBurse = burse
                break
            }
        }

        if(burseName === "Bitmart")
        {
            logger.verbose("BUY for: " + forUsd + "$")
            // buy USD sell BTC
            await selectedBurse.createOrder(pair, false, forUsd).then(res => logger.verbose( JSON.stringify(res)))
                .catch(err => {
                    throw "Failed to create Bitmart order"
                })
        }
        else if(burseName === "Gateio")
        {
            var depth = {}
            await selectedBurse.getDepth(pair).then(res => depth = res)
                .catch(err => {
                    throw "FAILED TO GET DEPTH"
                })
            
            const buyAmount = forUsd/depth.asks[0].price
            logger.verbose("BUY: " + buyAmount + " tokens")
            //                                        USD,  CURRENCY
            await selectedBurse.createOrder(pair, true, depth.asks[0].price, buyAmount).then(res => logger.verbose( JSON.stringify(res)))
                .catch(err => {
                    logger.error(JSON.stringify(err))
                    throw "Failed to create Gateio order"
                })
        }
        else if(burseName === "Mexc")
        {
            var depth = {}
            await selectedBurse.getDepth(pair, true, "1200", "0.001").then(res => depth = res)
            .catch(err => {
                throw "FAILED TO GET DEPTH"
            })
            const buyAmount = forUsd/depth.asks[0].price
            logger.verbose("BUY: " + buyAmount + " tokens")
            //                                        USD,  CURRENCY
            await selectedBurse.createOrder(pair, true, depth.asks[0].price, buyAmount).then(res => logger.verbose( JSON.stringify(res)))
                .catch(err => {
                    throw "Failed to create Mexc order"
                })
        }
        else
            throw "INVALID BURSE NAME"
    }
    catch(e)
    {
        console.error(e)
    }
}