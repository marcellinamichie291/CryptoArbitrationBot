class PairsDepthComparator {

    constructor(burses, callback){
        this.burses = burses
        this.finishedCallback = callback
    }

    comparedPairs = new Array()

    async compare(pairs) {
        this.comparedPairs = []
        this.pairsToCompare = pairs
        for(const pair of pairs)
        {
            for(const burse of this.burses)
            {
                if(burse.constructor.name === pair.lowest)
                {
                    burse.getDepth(pair.pair).then(res => {
                        this.onReceiveAsks(res)
                    })
                }
                 if(burse.constructor.name === pair.highest)
                {
                     burse.getDepth(pair.pair).then(res => {
                        this.onReceiveBids(res)
                    })
                }
            }

            //console.log(highestPriceBurseAsks)

            // if(highestPriceBurseAsks.length > 0 && lowestPriceBurseBids.length > 0)
            // {
            //     var diff = 100-((lowestPriceBurseBids[0] / highestPriceBurseAsks[0])*100)
            //     console.log("DEPTH DIFFERENCE FOR: "  + pair.pair + " IS " + diff)
            // }
        }
        
    }

    onReceiveAsks(asks) {
        //console.log(asks)
        var found = false
        for(var pair of this.comparedPairs)
        {
            if(asks.pair === pair.pair)
            {
                pair.buy = asks.asks[0]
                found = true;
                break;
            }
        }
        if(found === false)
            this.comparedPairs.push({pair: asks.pair, buy: asks.asks[0]})

        if(this.comparedPairs.length == this.pairsToCompare.length       
             && this.comparedPairs[this.comparedPairs.length-1].hasOwnProperty("buy")
             && this.comparedPairs+[this.comparedPairs.length-1].hasOwnProperty("sell"))
        {
            //console.log(this.comparedPairs[this.comparedPairs.length-1])
            // for(const pair of this.comparedPairs)
            //     console.log(pair)
            // console.log("OK")
        }
    }

    onReceiveBids(bids) {
        //console.log(bids)
        var found = false
        for(var pair of this.comparedPairs)
        {
            if(bids.pair === pair.pair)
            {
                pair.sell = bids.bids[0]
                found = true;
                break;
            }
        }
        if(found === false)
            this.comparedPairs.push({pair: bids.pair, sell: bids.bids[0]})

        if(this.comparedPairs.length == this.pairsToCompare.length       
            && this.comparedPairs[this.comparedPairs.length-1].hasOwnProperty("buy")
            && this.comparedPairs+[this.comparedPairs.length-1].hasOwnProperty("sell"))
        {
            //console.log(this.comparedPairs[this.comparedPairs.length-1])
            // for(const pair of this.comparedPairs)
            //     console.log(pair)
            // console.log("OK")
        }
    }
}

module.exports = PairsDepthComparator // 👈 Export class