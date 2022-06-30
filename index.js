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

//for(const burse of burses)
    burses[0].getWithdrawFee("HERO").then(res => logger.verbose(JSON.stringify(res)))
    burses[1].getWithdrawFee("HERO").then(res => logger.verbose(JSON.stringify(res)))
    burses[2].getWithdrawFee("HERO").then(res => logger.verbose(JSON.stringify(res)))

// helper = new Helper()
// helper.timeoutAfter(10, onRefreshCurrenciesState, null)

// function onRefreshCurrenciesState()
// {
//   console.log(this)
// }

tradeSimulator = new TradeSimulator(burses)