class BursesPriceComparator {
    msTimeoutTotal = 0

    constructor(burses){
        this.burses = burses

        for(const burse of this.burses)
            this.msTimeoutTotal += burse.getTickersTimeoutInterval()
    }

    async compare(pairsToCompare, wait = 3000) {
        if(this.compareInProgress)
            return {status: "Failed", reason: "Compare is in progress"}

        this.pairsToCompare = pairsToCompare

        if(this.pairsToCompare) {
            console.log("COMPARE PAIRS: " + pairsToCompare)

            if(this.tickerTimeoutTimerHandler)
            {
                clearTimeout(this.tickerTimeoutTimerHandler)
                this.tickerTimeoutTimerHandler = 0
            }

            this.tickerTimeoutTimerHandler = setTimeout(res => this.onTickerReceiveTimeout(), wait);

            this.compareInProgress = true

            for(const burse of this.burses) {
                for(const pair of this.pairsToCompare) {
                    burse.getTicker(pair).then(res => this.onTickerReceived(res))
                            .catch(error => {
                                console.error(burse.constructor.name)
                                console.error("FAILED TO GET TICKER " + error); 
                            });
                }
            }
        }
        else
        {
            // if(this.tickersTimeoutTimerHandler)
            // {
            //     clearTimeout(this.tickersTimeoutTimerHandler)
            //     this.tickersTimeoutTimerHandler = 0
            // }
            // this.tickersTimeoutTimerHandler = setTimeout(res => this.onTickersReceiveTimeout(), this.msTimeoutTotal);
            //this.compareInProgress = true

            var receivedTickers = new Array()
            var tickersDiffs = new Array()
            for(const burse of this.burses) {
                //burse.parsePairs();
                await burse.getTickers().then(res => {
                    for(var ticker of burse.prices)
                    {
                       ticker.burse = burse.constructor.name
                        receivedTickers.push(ticker)
                    }
                    console.log("BURSE: " + burse.constructor.name + " FOUND " +  burse.prices + " TICKERS")
                }).catch(error => { console.error("FAILED TO GET TICKERS " + error); });
            }
            
            await this.alignPairsAndBurses(receivedTickers)
                .then(alignedPairs => this.compareCompletePairsArray(alignedPairs)
                .then(tickersDifferences => tickersDiffs = tickersDifferences))
            
            console.log(tickersDiffs)
            return tickersDiffs
        }
    }

    onTickerReceived(res)
    {
        this.receivedTickers.push(res)
    }

    onTickerReceiveTimeout() {
        this.beginCompareTickerArray()
        this.receivedTickers = []
    }

    onTickersReceived(res)
    {
        this.receivedTickers.push(res)

        if(this.receivedTickers.length === this.burses.length) {
            //console.log("GET TICKERS SUCCESSFUL")
            this.beginCompareTickersArray()
            this.foundAllTickers = true
            this.receivedTickers = []
        }
    }

    async onTickersReceiveTimeout() {
        if(this.foundAllTickers === true)
        {
            this.foundAllTickers = false
            return {status: "Failed", reason: "Timeout, failed to get tickers."}
        }
        
        if(this.receivedTickers.length !== this.burses.length) {
            console.error("FAILED TO GET TICKERS CORRECTLY RECEIVED: " + this.receivedTickers.length + " OF " + this.burses.length)
            this.receivedTickers = []
        }
    }

    async alignPairsAndBurses(pairs) {
        var pairsArray = new Array()

        for(const cPair of pairs) 
        {
            var exists = false
            var pair = ''
            if(cPair.pair.includes("_USDT") == false || cPair.pair.includes("3") ||cPair.pair.includes("5"))
                continue
            for(const array_price of pairsArray)
            {
                if(array_price.pair == cPair.pair)
                {
                    exists = true
                    pair = array_price.pair
                    break
                }
            }
            if(exists == false)
            {
                pairsArray.push({pair: cPair.pair, burses: [{price: cPair.last_price, burse: cPair.burse}]})
            }
            else
            {
                for(var array_price of pairsArray)
                {
                    if(array_price.pair == pair)
                    {
                        var exists = false
                        for(const price_burses of array_price.burses)
                        {
                            if(price_burses.burse == cPair.burse)
                            {
                                exists = true
                                break
                            }
                        }
                        if(exists == false)
                            array_price.burses.push({price: cPair.last_price, burse: cPair.burse})
                        break
                    }
                }
            }
        }

        return pairsArray
    }

    beginCompareTickerArray() {
        this.pairsArray = []
        this.priceDifferences = []

        for(const ticker of this.receivedTickers) 
        {
            var exists = false
            var pair = ''
            for(const array_price of this.pairsArray)
            {
                if(array_price.pair == ticker.pair)
                {
                    exists = true
                    pair = array_price.pair
                    break
                }
            }
            if(exists == false)
            {
                this.pairsArray.push({pair: ticker.pair, burses: [{price: ticker.last_price, burse: ticker.burse}]})
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
                            if(price_burses.burse == ticker.burse)
                            {
                                exists = true
                                break
                            }
                        }
                        if(exists == false)
                            array_price.burses.push({price: ticker.last_price, burse: ticker.burse})
                        break
                    }
                }
            }
        }

        this.compareCompletePairsArray()

    }

    async compareCompletePairsArray(pairsWithBurses)
    {
        var priceDifferences = new Array()

        for(var vPair of pairsWithBurses)
        {
            if(vPair.burses.length < 2)
               continue
            
            var lowestBurse, lowestPrice = Math.floor(Number.MAX_SAFE_INTEGER)
            var highestBurse, highestPrice = Math.floor(Number.MIN_SAFE_INTEGER)
            for(const burse of vPair.burses)
            {
                if(lowestPrice > burse.price)
                {
                    lowestBurse = burse.burse
                    lowestPrice = burse.price
                }
                if(highestPrice < burse.price)
                {
                    highestBurse = burse.burse
                    highestPrice = burse.price
                }
            }
            var diff = 100-((lowestPrice / highestPrice)*100)
            priceDifferences.push({pair: vPair.pair, highest: highestBurse, lowest: lowestBurse, diff: diff})
        }
    
        priceDifferences.sort((a, b) => b.diff - a.diff)

        return priceDifferences
    }
}

module.exports = BursesPriceComparator // 👈 Export class