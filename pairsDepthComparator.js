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

            if(buys.length > 0 && sells.length > 0)
            {
                 var diff = 100-((buys[0].price / sells[0].price)*100)
                 if(diff > 2)
                 {
                    console.log("**********************************************************************")
                    console.log("BUY AT: " + buysBurse + " FOR: " + buys[0].price)
                    console.log("SELL AT: " + sellsBurse + " FOR: " + sells[0].price)
                    console.log("DEPTH DIFFERENCE FOR: "  + pair.pair + " IS " + diff)
                    console.log("**********************************************************************")
                 }
            }

            this.comparedPairs.push({pair: pair.pair, buyBurse: buysBurse, sellBurse: sellsBurse, buys: buys, sells: sells})
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
                //console.log("ADD FOR: "+ asks.pair)
                //if(this.comparedPairs[this.comparedPairs.length-1].hasOwnProperty("buy"))
                //    console.log("JE TU ASK 1!!!!")
                found = true;
                break;
            }
        }
        if(found === false)
        {
            //console.log("CREATE FOR: "+ asks.pair)
            this.comparedPairs.push({pair: asks.pair, buy: asks.asks[0]})

           // if(this.comparedPairs[this.comparedPairs.length-1].hasOwnProperty("buy"))
            //    console.log("JE TU ASK 2!!!!")
        }

        if(this.comparedPairs.length === this.pairsToCompare.length       
             && this.comparedPairs[this.comparedPairs.length-1].hasOwnProperty("buy")
             && this.comparedPairs+[this.comparedPairs.length-1].hasOwnProperty("sell"))
        {
            //console.log(this.comparedPairs[this.comparedPairs.length-1])
            // for(const pair of this.comparedPairs)
            //     console.log(pair)
            console.log("OK " + asks.pair + " " + this.comparedPairs.length)
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
                //console.log("ADD FOR: "+ bids.pair)
                //if(this.comparedPairs[this.comparedPairs.length-1].hasOwnProperty("sell"))
                //    console.log("JE TU SELL 1!!!!")
                found = true;
                break;
            }
        }
        if(found === false)
        {
           // console.log("CREATE FOR: "+ bids.pair)
            this.comparedPairs.push({pair: bids.pair, buy: bids.bids[0]})
            //if(this.comparedPairs[this.comparedPairs.length-1].hasOwnProperty("sell"))
            //    console.log("JE TU SELL 2!!!!")
        }

        if(this.comparedPairs.length === this.pairsToCompare.length       
            && this.comparedPairs[this.comparedPairs.length-1].hasOwnProperty("buy")
            && this.comparedPairs+[this.comparedPairs.length-1].hasOwnProperty("sell"))
        {
            //console.log(this.comparedPairs[this.comparedPairs.length-1])
            // for(const pair of this.comparedPairs)
            //     console.log(pair)
            console.log("OK " + bids.pair + " " + this.comparedPairs.length)
        }
    }
}

module.exports = PairsDepthComparator // 👈 Export class