bu = require("./Burse")
const axios = require('axios');
const fse = require('fs-extra');

class Bitmart extends(bu){

    currencies = new Array()
    constructor()   
    {
        super()
        axios
        .get('https://api-cloud.bitmart.com/account/v1/currencies')
        .then(res => {
            for(const currency of res.data.data.currencies)
            {
                //for(const split of currencies)
                //    console.log(split);
                //var value = {from: currencies[0], to: currencies[1]}
                this.currencies.push(currency)
            }
            //console.dir(this.pairs)
            //var roughObjSize = JSON.stringify(res.data.data).length;
        })
        .catch(error => {
            console.error(error);
        });
    }

    parsePairs() {
        //console.log("parsePairs Bitmart")

        axios
        .get('https://api-cloud.bitmart.com/spot/v1/symbols')
        .then(res => {
            for(const pair of res.data.data.symbols)
            {
                var currencies = pair.split('_')
                //for(const split of currencies)
                //    console.log(split);
                var value = {from: currencies[0], to: currencies[1]}
                this.pairs.push(value)
            }
            //console.dir(this.pairs)
            //var roughObjSize = JSON.stringify(res.data.data).length;
            console.log("Bitmart found pairs: " + res.data.data.symbols.length);
        })
        .catch(error => {
            console.error(error);
        });

    } 

    getTickers() {   
        //console.log("getTickers Bitmart")
        return new Promise((resolve, reject) => {
            axios
            .get('https://api-cloud.bitmart.com/spot/v1/ticker')
            .then(res => {
                //console.log(`statusCode: ${res.status}`);
                //fse.outputJsonSync('./tickers_bitmart.json', res.data);
                for(const ticker of res.data.data.tickers)
                {
                    this.prices.push({pair: ticker.symbol, last_price: ticker.last_price})
                }
                //console.dir(this.prices)
                //var roughObjSize = JSON.stringify(res.data.data).length;
                //console.log(res.data.data.tickers.length);
                resolve(this.constructor.name)
            })
            .catch(error => {
                console.error(error);
                reject(error)
            });
        })
    }

    getTicker(pair) {   
        //console.log("getTicker Bitmart")
        return new Promise((resolve, reject) => {
            var tickerRequest = 'https://api-cloud.bitmart.com/spot/v1/ticker?symbol='
            tickerRequest += pair
            axios
            .get(tickerRequest)
            .then(res => {
                var pair;
                for(const ticker of res.data.data.tickers)
                {
                    pair = {burse: this.constructor.name, pair: ticker.symbol, last_price: ticker.last_price}
                }

                resolve(pair)
            })
            .catch(error => {
                //console.error(error);
                reject(error)
            });
        })
    }

    getTickersTimeoutInterval() {
        return 3000;
    }

    getDepth(pair, precision = 5) {
        //console.log("getDepth Bitmart")
        var asksDepth = new Array();
        var bidsDepth = new Array();
        return new Promise((resolve, reject) => {
            var getDepthRequest = "https://api-cloud.bitmart.com/spot/v1/symbols/book?symbol="
            getDepthRequest += pair
            getDepthRequest += "&precision="
            getDepthRequest += precision
            axios
            .get(getDepthRequest)
            .then(res => {
                for(const ask of res.data.data.buys) {
                    asksDepth.push({price: ask.price, amount: ask.total})
                }
                for(const bid of res.data.data.sells) {
                    bidsDepth.push({price: bid.price, amount: bid.total})
                }
                var depthOfPair = {pair: pair, burse: this.constructor.name, asks: asksDepth, bids: bidsDepth}
                resolve(depthOfPair)
            })
            .catch(error => {
                console.error(error)
                reject(error)
            });
        })  
    }

    getCurrencyInfo(pair)
    {
        if(pair.includes("_USDT") === false)
            return {}
        pair =pair.replace("_USDT", "")
        
        for(const currency of this.currencies)
        {
            if(currency.currency === pair)
            {
                
            }
        }
        return {}
    }
}

module.exports = Bitmart // 👈 Export class