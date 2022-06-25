class PairsDepthComparator {

    constructor(burses, finishCallback, progressCallback){
        this.burses = burses
        this.finishedCallback = finishCallback
        this.progressCallback = progressCallback
    }

    async compare(pairs) {
        var comparedPairs = new Array()
        this.pairsToCompare = pairs
        for(const pair of pairs)
        {
            var buys
            var sells
            var buysBurse
            var sellsBurse
            
            for(const burse of this.burses)
            {
                if(burse.constructor.name === pair.lowest)
                {
                    var b = await burse.getDepth(pair.pair).then()
                    buys = b.asks
                    buysBurse = burse.constructor.name
                }
                if(burse.constructor.name === pair.highest)
                {
                    var s = await burse.getDepth(pair.pair).then()
                    sells = s.bids
                    sellsBurse = burse.constructor.name
                }
            }
            comparedPairs.push({pair: pair.pair, buyBurse: buysBurse, sellBurse: sellsBurse, buys: buys, sells: sells})
            this.progressCallback(comparedPairs.length + "/" + pairs.length)
        }
        this.finishedCallback(comparedPairs)
    }
}

module.exports = PairsDepthComparator // 👈 Export class