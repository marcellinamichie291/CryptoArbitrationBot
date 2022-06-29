class PairsDepthComparator {

    constructor(burses, memberCallbackFinished, memberCallbackProgress){
        this.burses = burses
        this.finishedCallback = memberCallbackFinished.function
        this.finishCallbackInstance = memberCallbackFinished.functionContext
        this.progressCallback = memberCallbackProgress.function
        this.progressCallbackInstance = memberCallbackProgress.functionContext
    }

    async compare(pairs) {
        var comparedPairs = new Array()
        this.pairsToCompare = pairs
        var errors = 0
        for(const pair of pairs)
        {
            var buys
            var sells
            var buysBurse
            var sellsBurse
            
            for(const burse of this.burses)
            {
                var error = false
                if(burse.constructor.name === pair.lowest)
                {
                    await burse.getDepth(pair.pair).then(res => {
                        buys = res.asks
                        buysBurse = burse.constructor.name
                    }).catch(error => {
                        console.error(error)
                        error = true
                        errors+=1
                    })
                }
                if(burse.constructor.name === pair.highest && error === false)
                {
                    await burse.getDepth(pair.pair).then(res => {
                    sells = res.bids
                    sellsBurse = burse.constructor.name
                    }).catch(error => {
                        console.error(error)
                        error = true
                        errors+=1
                    })
                }
            }
            if(error === false)
            {
                comparedPairs.push({pair: pair.pair, buyBurse: buysBurse, sellBurse: sellsBurse, buys: buys, sells: sells})
            }
            this.progressCallback(comparedPairs.length + "/" + (pairs.length - errors), this.progressCallbackInstance)
        }
        this.finishedCallback(comparedPairs, this.finishCallbackInstance)
    }
}

module.exports = PairsDepthComparator // 👈 Export class