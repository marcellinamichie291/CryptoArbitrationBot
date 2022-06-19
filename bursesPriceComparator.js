class BursesPriceComparator {
    pairsToCompare = new Array();
    receivedTickers = new Array();
    foundAllTickers = false
    compareInProgress = false
    msTimeoutTotal = 0
    tickersTimeoutTimerHandler = 0

    constructor(burses, callback){
        this.burses = burses
        this.finishedCallback = callback

        for(const burse of this.burses)
            this.msTimeoutTotal += burse.getTickersTimeoutInterval()
    }

    compare(pairsToCompare, wait = 3000) {
        if(this.compareInProgress)
            return false

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
                                    .catch(error => { console.error("FAILED TO GET TICKER " + error); });
                }
            }
        }
        else
        {
            if(this.tickersTimeoutTimerHandler)
            {
                clearTimeout(this.tickersTimeoutTimerHandler)
                this.tickersTimeoutTimerHandler = 0
            }
            this.tickersTimeoutTimerHandler = setTimeout(res => this.onTickersReceiveTimeout(), this.msTimeoutTotal);

            this.compareInProgress = true

            for(const burse of this.burses) {
                burse.parsePairs();
                burse.getTickers().then(res => this.onTickersReceived(res))
                                .catch(error => { console.error("FAILED TO GET TICKERS " + error); });
            }

            return true
        }
    }

    onTickerReceived(res)
    {
        this.receivedTickers.push(res)
        //console.log(res)
        // this.receivedTickers.push(res)

        // if(this.receivedTickers.length === this.burses.length) {
        //     console.log("GET TICKERS SUCCESSFUL")
        //     this.beginCompare()
        //     this.foundAllTickers = true
        //     this.receivedTickers = []
        // }
    }

    onTickerReceiveTimeout() {
        //console.dir(this.receivedTickers)
        this.beginCompareTickerArray()
        this.receivedTickers = []
    }

    onTickersReceived(res)
    {
        this.receivedTickers.push(res)

        if(this.receivedTickers.length === this.burses.length) {
            console.log("GET TICKERS SUCCESSFUL")
            this.beginCompareTickersArray()
            this.foundAllTickers = true
            this.receivedTickers = []
        }
    }

    onTickersReceiveTimeout() {
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
    beginCompareTickersArray() {
        this.pairsArray = []
        this.priceDifferences = []

        for(const burse of this.burses)
        {
            for(const burse_price of burse.prices) 
            {
                var exists = false
                var pair = ''
                if(burse_price.pair.includes("_USDT") == false || burse_price.pair.includes("3") ||burse_price.pair.includes("5"))
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

        this.compareCompletePairsArray()
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

    compareCompletePairsArray()
    {
        for(var pair of this.pairsArray)
        {
            if(pair.burses.length < 2)
               continue
            
            var lowestBurse, lowestPrice = Math.floor(Number.MAX_SAFE_INTEGER)
            var highestBurse, highestPrice = Math.floor(Number.MIN_SAFE_INTEGER)
            for(const burse of pair.burses)
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
            this.priceDifferences.push({pair: pair.pair, highest: highestBurse, lowest: lowestBurse, diff: diff})
        }
    
        this.priceDifferences.sort((a, b) => b.diff - a.diff)

        this.compareInProgress = false

        this.finishedCallback(this.priceDifferences)        
    }
}

module.exports = BursesPriceComparator // 👈 Export class