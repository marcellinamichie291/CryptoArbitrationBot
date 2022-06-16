bu = require("./Burse")
const axios = require('axios');
const fse = require('fs-extra');

class Gateio extends(bu){
    
    pairs = new Array();
    prices = new Array();

    parsePairs() {
        console.log("parsePairs Gateio")

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
        console.log("getTickers Gateio")
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
}

module.exports = Gateio // 👈 Export class