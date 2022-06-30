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
    burse.getCurrencyInfo("PSP_USDT").then(res => logger.verbose(burse.constructor.name + ": " + JSON.stringify(res)))
    .then(res => logger.verbose(burse.constructor.name + ": " + JSON.stringify(res)))
    .catch(err => logger.error(burse.constructor.name + ": " + JSON.stringify(err)))
    //burse.getWithdrawFee("EMPIRE").then(res => logger.verbose(burse.constructor.name + ": " + JSON.stringify(res)))
}