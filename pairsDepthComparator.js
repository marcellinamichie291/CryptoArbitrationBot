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
        var skipped = 0
        for(const pair of pairs)
        {
            var buys
            var sells
            var buysBurse
            var sellsBurse
            var withdraw_fee
            
            for(const burse of this.burses)
            {
                var error = false
                var skip = false
                if(burse.constructor.name === pair.lowest)
                {
                    await burse.getDepth(pair.pair).then(async res => {
                        // buy crypto for USDT
                        buys = res.asks
                        buysBurse = burse.constructor.name

                        var currency = pair.pair.replace("_USDT", "")
                        await burse.getWithdrawFee(currency)
                        .then(res => withdraw_fee=res.withdraw_fee)
                        .catch(error =>  { 
                            console.error("FAILED TO GET FEE FOR: " + pair.pair + " AT: " + burse.constructor.name)
                            error = true
                            errors+=1
                        })

                    }).catch(error => {
                        console.error("FAILED TO GET DEPTH FOR: " + pair.pair + " AT: " + burse.constructor.name)
                        error = true
                        errors+=1
                    })
                }
                if(burse.constructor.name === pair.highest && error === false)
                {
                    await burse.getDepth(pair.pair).then(res => {
                        // sell crypto fir USDT
                        sells = res.bids
                        sellsBurse = burse.constructor.name
                    }).catch(error => {
                        console.error("FAILED TO GET DEPTH FOR: " + pair.pair + " AT: " + burse.constructor.name)
                        error = true
                        errors+=1
                    })
                }
            }
            if(error === false && skip === false)
            {
                comparedPairs.push({pair: pair.pair, buyBurse: buysBurse, sellBurse: sellsBurse, buys: buys, sells: sells})
            }
            this.progressCallback(comparedPairs.length + "/" + (pairs.length - errors - skipped), this.progressCallbackInstance)
        }
        this.finishedCallback(comparedPairs, this.finishCallbackInstance)
    }
}

module.exports = PairsDepthComparator // 👈 Export class