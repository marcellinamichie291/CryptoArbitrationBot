class BursesPriceComparator {

    buyPairsToCompare = new Array("", "a");

    receivedTickers = new Array();
    foundAllTickers = false
    compareInProgress = false
    msTimeoutTotal = 0

    constructor(burses, callback){
        this.burses = burses
        this.finishedCallback = callback

        for(const burse of this.burses)
            this.msTimeoutTotal += burse.getTickersTimeoutInterval()
    }

    compare() {
        if(this.compareInProgress)
            return false

        this.compareInProgress = true

        for(const burse of this.burses) {
            burse.parsePairs();
            burse.getTickers().then(res => this.onTickersReceived(res))
                              .catch(error => { console.error("FAILED TO GET TICKERS " + error); });
        }

        setTimeout(res => this.onTicketsReceiveTimeout(), this.msTimeoutTotal);

        return true
    }

    onTickersReceived(res)
    {
        this.receivedTickers.push(res)

        if(this.receivedTickers.length === this.burses.length) {
            console.log("GET TICKERS SUCCESSFUL")
            this.beginCompare()
            this.foundAllTickers = true
            this.receivedTickers = []
        }
    }

    onTicketsReceiveTimeout() {
        if(this.foundAllTickers === true)
        {
            this.foundAllTickers = false
            return
        }
        
        if(this.receivedTickers.length !== this.burses.length) {
            console.error("FAILED TO GET TICKERS CORRECTLY RECEIVED: " + this.receivedTickers.length + " OF " + this.burses.length)
            this.beginCompare()
            this.receivedTickers = []
        }
    }

    pairsArray = new Array()
    priceDifferences = new Array()
    beginCompare() {
        this.pairsArray = []
        this.priceDifferences = []
        for(const burse of this.burses)
        {
            for(const burse_price of burse.prices) 
            {
                var exists = false
                var pair = ''
                if(burse_price.pair.includes("_USDT") == false)
                    continue
                for(const array_price of this.pairsArray)
                {
                    if(array_price.pair == burse_price.pair)
                    {
                        exists = true
                        pair = array_price.pair
                        break
                    }
                }
                if(exists == false)
                {
                    this.pairsArray.push({pair: burse_price.pair, burses: [{price: burse_price.last_price, burse: burse.constructor.name}]})
                }
                else
                {
                    for(var array_price of this.pairsArray)
                    {
                        if(array_price.pair == pair)
                        {
                            var exists = false
                            for(const price_burses of array_price.burses)
                            {
                                if(price_burses.burse == burse.constructor.name)
                                {
                                    exists = true
                                    break
                                }
                            }
                            if(exists == false)
                                array_price.burses.push({price: burse_price.last_price, burse: burse.constructor.name})
                            break
                        }
                    }
                }
            }
        }

       this.finishedCallback(this.pairsArray)

       this.compareInProgress = false

        // var indexBurseOne = 1
        // var indexBurseTwo = 0
        // for(const price1 of this.burses[indexBurseOne].prices) {
        //     for(const price0 of this.burses[indexBurseTwo].prices) {

        //         if(price1.pair === price0.pair && price0.pair.includes("_USDT"))
        //         {
        //             var maximum = Math.max(price0.last_price, price1.last_price)
        //             var minimum = Math.min(price0.last_price, price1.last_price)
        //             var onePercent = maximum / 100
        //             //diff = maximum - minimum;
        //             var diff = 100-((minimum / maximum)*100)
        //             var lowerPrice
        //             if(price0.last_price < price1.last_price)
        //                 lowerPrice = this.burses[indexBurseTwo].constructor.name
        //             else
        //                 lowerPrice = this.burses[indexBurseOne].constructor.name
        //             //diff = price0.last_price - 
        //             var priceDifference = {pair: price0.pair, diff: diff, lower: lowerPrice }//, price: minimum}
        //             if(diff > 0.5 && diff < 50)
        //                 this.priceDifferences.push(priceDifference)
        //         }
        //     }
        // }
        // // sort by deifference
        // this.priceDifferences.sort((a, b) => b.diff - a.diff)
        // console.dir(this.priceDifferences)
    }
}

module.exports = BursesPriceComparator // 👈 Export class