bu = require("./Burse")
const axios = require('axios');
const fse = require('fs-extra');

class Bitmart extends(bu){

    parsePairs() {
        console.log("parsePairs Bitmart")

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
        console.log("getTickers Bitmart")
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
        console.log("getTicker Bitmart")
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

    getDepth(pair, precision = 6) {
        console.log("getDepth Bitmart")
        return new Promise((resolve, reject) => {
            var getDepthRequest = "https://api-cloud.bitmart.com/spot/v1/symbols/book?symbol="
            getDepthRequest += pair
            getDepthRequest += "&precision="
            getDepthRequest += precision
            axios
            .get(getDepthRequest)
            .then(res => {
                //console.log(`statusCode: ${res.status}`);
                //fse.outputJsonSync('./tickers_bitmart.json', res.data);
                console.dir(res.data)
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
}

module.exports = Bitmart // 👈 Export class