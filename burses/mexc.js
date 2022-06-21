bu = require("./Burse")
const axios = require('axios');
const fse = require('fs-extra');

class Mexc extends(bu){
    
    parsePairs() {
        console.log("parsePairs Mexc")

        axios
        .get('https://www.mexc.com/open/api/v2/market/symbols')
        .then(res => {
          //console.dir(res.data)
          //fse.outputJsonSync('./file.json', res.data); 
          for(const pair_obj of res.data.data)
          {
            var currencies = pair_obj.symbol.split('_')
            //for(const split of currencies)
            //    console.log(split);
            var value = {from: currencies[0], to: currencies[1]}
            this.pairs.push(value)
          }
          //console.dir(this.pairs)
          //var roughObjSize = JSON.stringify(res.data).length;
          console.log("Mexc found pairs: " + res.data.data.length);
        })
        .catch(error => {
          console.error(error);
        });
    }

    getTickers() {
        console.log("getTickers Mexc")
        return new Promise((resolve, reject) => {
            axios
            .get('https://www.mexc.com/open/api/v2/market/ticker')
            .then(res => {
                //console.log(`statusCode: ${res.status}`);
                //fse.outputJsonSync('./tickers_mexc.json', res.data);
                for(const ticker of res.data.data)
                {
                    this.prices.push({pair: ticker.symbol, last_price: ticker.last})
                }
                //console.dir(this.prices)
                //var roughObjSize = JSON.stringify(res.data.data).length;
                //console.log(res.data.length);
                resolve(this.constructor.name)
            })
            .catch(error => {
                console.error(error);
                reject(error)
            });
        })
    }

    getTicker(pair) {   
        console.log("getTicker Mexc")
        return new Promise((resolve, reject) => {
            var tickerRequest = 'https://www.mexc.com/open/api/v2/market/ticker?symbol='
            tickerRequest += pair
            axios
            .get(tickerRequest)
            .then(res => {
                var pair;
                for(const ticker of res.data.data)
                {
                    pair = {burse: this.constructor.name, pair: ticker.symbol, last_price: ticker.last}
                }
                resolve(pair)
            })
            .catch(error => {
                console.error(error);
                reject(error)
            });
        })
    }

    getTickersTimeoutInterval() {
        return 12000;
    }
    // {
    //     pair: 'CFX_USDT',
    //     burse: 'Gateio',
    //     asks: [
    //       { price: '0.051209', amount: '116.7' },
    //     ],
    //     binds: [
    //       { price: '0.051062', amount: '4700' },
    //     ]
    //   }
    getDepth(pair, precision = 12) {
        console.log("getDepth Mexc")
        var asksDepth = new Array();
        var bidsDepth = new Array();
        return new Promise((resolve, reject) => {
            var getDepthRequest = "https://www.mexc.com//open/api/v2/market/depth?symbol="
            getDepthRequest += pair
            getDepthRequest += "&depth="
            getDepthRequest += precision
            axios
            .get(getDepthRequest)
            .then(res => {
                for(const ask of res.data.data.asks) {
                    asksDepth.push({price: ask.price, amount: ask.quantity})
                }
                for(const bid of res.data.data.bids) {
                    bidsDepth.push({price: bid.price, amount: bid.quantity})
                }
                var depthOfPair = {pair: pair, burse: this.constructor.name, asks: asksDepth, bids: bidsDepth}
                resolve(depthOfPair)
            })
            .catch(error => {
                console.error(error);
                reject(error)
            });
        })  
    }
}

module.exports = Mexc // 👈 Export class