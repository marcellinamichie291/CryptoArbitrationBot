bu = require("./Burse")
const axios = require('axios');
const fse = require('fs-extra');

class Gateio extends(bu){

    constructor()
    {
        super()
    }

    parsePairs() {
       // console.log("parsePairs Gateio")
        axios
        .get('https://api.gateio.ws/api/v4/spot/currency_pairs')
        .then(res => {
          //console.dir(res.data)
          //fse.outputJsonSync('./file.json', res.data); 
          for(const pair_obj of res.data)
          {
              var value = {from: pair_obj.base, to: pair_obj.quote}
              this.pairs.push(value)
          }
          //console.dir(this.pairs)
          //var roughObjSize = JSON.stringify(res.data).length;
          console.log("Gateio found pairs: " + res.data.length);
        })
        .catch(error => {
          console.error(error);
        });
    }

    getTickers() {
       // console.log("getTickers Gateio")
        return new Promise((resolve, reject) => {
            axios
            .get('https://api.gateio.ws/api/v4/spot/tickers')
            .then(res => {
                //console.log(`statusCode: ${res.status}`);
                //fse.outputJsonSync('./tickers_gateio.json', res.data);
                for(const ticker of res.data)
                {
                    this.prices.push({pair: ticker.currency_pair, last_price: ticker.last})
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
       // console.log("getTicker Gateio")
        return new Promise((resolve, reject) => {
            var tickerRequest = 'https://api.gateio.ws/api/v4/spot/tickers?currency_pair='
            tickerRequest += pair
            axios
            .get(tickerRequest)
            .then(res => {
                var pair;
                for(const ticker of res.data)
                {
                    pair = {burse: this.constructor.name, pair: ticker.currency_pair, last_price: ticker.last}
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
        return 24000;
    }

    getDepth(pair, precision = 12) {
       // console.log("getDepth Bitmart")
        var asksDepth = new Array();
        var bidsDepth = new Array();
        return new Promise((resolve, reject) => {
            var getDepthRequest = "https://api.gateio.ws/api/v4/spot/order_book?currency_pair="
            getDepthRequest += pair
            getDepthRequest += "&limit="
            getDepthRequest += precision
            axios
            .get(getDepthRequest)
            .then(res => {
                for(const ask of res.data.asks) {
                    asksDepth.push({price: ask[0], amount: ask[1]})
                }
                for(const bid of res.data.bids) {
                    bidsDepth.push({price: bid[0], amount: bid[1]})
                }
                var depthOfPair = {pair: pair, burse: this.constructor.name, asks: asksDepth, bids: bidsDepth}
                
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

                resolve(depthOfPair)
            })
            .catch(error => {
                console.error(error);
                reject(error)
            });
        })  
    }

    getOnlyListOfCurrencyDetail()
    {
        return false
    }
}

module.exports = Gateio // 👈 Export class