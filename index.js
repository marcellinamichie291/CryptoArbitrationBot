const he = require('./helper')
const bm = require('./burses/bitmart')
const gi = require('./burses/gateio')
const me = require('./burses/mexc')
const ts = require('./TradeSimulator')
const TradeSimulator = require('./TradeSimulator')
const Helper = require('./helper')

//pairsToCompare = new Array("CFX_USDT", "KABY_USDT");

var burses = []; 
burses.push(new bm())
burses.push(new gi())
burses.push(new me())

// helper = new Helper()
// helper.timeoutAfter(10, onRefreshCurrenciesState, null)

// function onRefreshCurrenciesState()
// {
//   console.log(this)
// }

tradeSimulator = new TradeSimulator(burses)