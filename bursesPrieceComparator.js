
class BursesPrieceComparator {
    buyPairsToCompare = new Array("B", "a");
    sellPairsToCompare = new Array("B", "a");

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

        setTimeout(res => this.onTicketsReceiveTimeout(), 10000);
    }

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

    }
}

module.exports = BursesPrieceComparator // 👈 Export class