bu = require("./Burse")
const axios = require('axios');
const fse = require('fs-extra');

class Bitmart extends(bu){

    pairs = new Array();
    prieces = new Array();

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
                    this.prieces.push({pair: ticker.symbol, last_priece: ticker.last_price})
                }
                //console.dir(this.prieces)
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