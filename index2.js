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
burses[0].createOrder("BTC_USDT", false, "0.00049000").then(res => logger.verbose( JSON.stringify(res)))
    .catch(err => logger.error( JSON.stringify(err)))

// burses[1].createOrder("BTC_USDT", true, "0.000055", "18000", 2).then(res => logger.verbose( JSON.stringify(res)))
//     .catch(err => logger.error( JSON.stringify(err)))

// burses[2].createOrder("BTC_USDT", true, "0.000055", "18000").then(res => logger.verbose( JSON.stringify(res)))
//     .catch(err => logger.error( JSON.stringify(err)))

    