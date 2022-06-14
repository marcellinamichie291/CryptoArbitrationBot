
class BursesPrieceComparator {
    buyPairsToCompare = new Array("", "a");

    receivedTickers = new Array();

    constructor(burses){
        this.burses = burses
    }

    compare() {
        for(const burse of this.burses) {
            burse.parsePairs();
            burse.getTickers().then(res => this.onTickersReceived(res))
                              .catch(error => { console.error("FAILED TO GET TICKERS " + error); });
        }

        setTimeout(res => this.onTicketsReceiveTimeout(), 15000);
    }


    //usdtArray = new Array()
    prieceDifferences = new Array()
    onTickersReceived(res)
    {
        this.receivedTickers.push(res)

        if(this.receivedTickers.length === this.burses.length) {
            console.log("GET TICKERS SUCCESSFUL")
            this.beginCompare()
        }
    }

    onTicketsReceiveTimeout() {
        if(this.receivedTickers.length !== this.burses.length) {
            console.error("FAILED TO GET ALL TICKERS RECEIVED: " + this.receivedTickers.length + " OF " + this.burses.length)
            this.beginCompare()
        }
    }

    beginCompare() {
        for(const priece1 of this.burses[1].prieces) {
            for(const priece0 of this.burses[0].prieces) {

                if(priece1.pair === priece0.pair && priece0.pair.includes("_USDT"))
                {
                    var maximum = Math.max(priece0.last_priece, priece1.last_priece)
                    var minimum = Math.min(priece0.last_priece, priece1.last_priece)
                    var onePercent = maximum / 100
                    //diff = maximum - minimum;
                    var diff = 100-((minimum / maximum)*100)

                    //diff = priece0.last_priece - 
                    var prieceDifference = {pair: priece0.pair, difference: diff}
                    this.prieceDifferences.push(prieceDifference)
                }
                // if(priece.pair.includes("_USDT"))
                // {
                //     console.log(priece)
                //     this.usdtArray.push(priece)
                // }
            }
            // if(priece.pair.includes("_USDT"))
            // {
            //     console.log(priece)
            //     this.usdtArray.push(priece)
            // }
        }
        //console.log("FOUND: " + this.usdtArray.length)

        this.prieceDifferences.sort((a, b) => b.difference - a.difference)
        console.dir(this.prieceDifferences)
    }
}

module.exports = BursesPrieceComparator // 👈 Export class