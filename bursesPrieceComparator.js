
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

        // for(const base_burse of this.burses) {

        //     for(const search_burse of this.burses) {
        //         if(search_burse.constructor.name == base_burse.constructor.name)
        //             continue
                
        //     }
        // }

        var indexBurseOne = 1
        var indexBurseTwo = 0
        for(const priece1 of this.burses[indexBurseOne].prieces) {
            for(const priece0 of this.burses[indexBurseTwo].prieces) {

                if(priece1.pair === priece0.pair && priece0.pair.includes("_USDT"))
                {
                    var maximum = Math.max(priece0.last_priece, priece1.last_priece)
                    var minimum = Math.min(priece0.last_priece, priece1.last_priece)
                    var onePercent = maximum / 100
                    //diff = maximum - minimum;
                    var diff = 100-((minimum / maximum)*100)
                    var lowerPriece
                    if(priece0.last_priece < priece1.last_priece)
                        lowerPriece = this.burses[indexBurseTwo].constructor.name
                    else
                        lowerPriece = this.burses[indexBurseOne].constructor.name
                    //diff = priece0.last_priece - 
                    var prieceDifference = {pair: priece0.pair, diff: diff, lower: lowerPriece }//, priece: minimum}
                    if(diff > 0.5 && diff < 50)
                        this.prieceDifferences.push(prieceDifference)
                }
            }
        }
        // sort by deifference
        this.prieceDifferences.sort((a, b) => b.diff - a.diff)
        console.dir(this.prieceDifferences)
    }
}

module.exports = BursesPrieceComparator // 👈 Export class