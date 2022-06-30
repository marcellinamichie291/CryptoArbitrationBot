bu = require("./Burse")
const axios = require('axios');
const fse = require('fs-extra');
const crypto = require('crypto');

class Gateio extends(bu){

    constructor()
    {
        super()
    }

    getKey(){
        return process.env.GATEIO_KEY
    }
  
    getSecret(){
        return process.env.GATEIO_SECRET
    }

    parsePairs() {
       // logger.verbose("parsePairs Gateio")
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
          logger.verbose("Gateio found pairs: " + res.data.length);
        })
        .catch(error => {
          console.error(error);
        });
    }

    getTickers() {
       // logger.verbose("getTickers Gateio")
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
                //logger.verbose(JSON.stringify(res).data.length);
                resolve(this.constructor.name)
            })
            .catch(error => {
                console.error(error);
                reject(error)
            });
        })
    }

    getTicker(pair) {   
       // logger.verbose("getTicker Gateio")
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
       // logger.verbose("getDepth Bitmart")
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
                reject("FAILED TO GET DEPTH FOR BURSE: " + this.constructor.name + ", PAIR: " + pair + ", ERROR: " + error)
            });
        })  
    }

    getOnlyListOfCurrencyDetail()
    {
        return false
    }

    onRefreshCurrenciesTick()
    {
        return new Promise((resolve, reject) => {
            const currentDatetimeTs = Date.now()
            if(currentDatetimeTs - this.lastCurrenciesUpdate < 6000)
                reject("RECENTLY REFRESHED")
            
            this.currencies = []
            axios.get('https://api.gateio.ws/api/v4/spot/currencies')
            .then(res => {
                for(const currency of res.data)
                {
                    try {
                        if(currency.chain === undefined)
                            continue
                        var res = super.parseChainName(currency.chain)
                        this.currencies.push({currency: currency.currency, chain:res, withdraw: !currency.withdraw_disabled, deposit: !currency.deposit_disabled})
                    
                    } catch (error) {
                    }
                }
                this.lastCurrenciesUpdateTs = Date.now();
                resolve(this.currencies)
            })
            .catch(error => {
                reject(error)
            });
        })
    }

    // /spot/currencies
    getCurrentCurrencyInfo(pair)
    {
        return new Promise((resolve, reject) => {
            if(pair.includes("_USDT") === false)
                throw 500
            pair = pair.replace("_USDT", "")
            
            axios.get('https://api.gateio.ws/api/v4/spot/currencies/' + pair)
            .then(res => {
                try {
                    var resChain = super.parseChainName(res.data.chain)
                    resolve({currency: res.data.currency, chain:resChain, withdraw: !res.data.withdraw_disabled, deposit: !res.data.deposit_disabled})
                } catch (error) {
                    reject(error)
                }
            })
            .catch(error => {
                reject(error)
            });
        })
    }
    
    getSign(method, prefix, url, query, payload, stamp)
    {
        var hash = crypto.createHash('sha512');
        var data = hash.update(payload ? payload : "", 'utf-8');
        var gen_hash = data.digest('hex');   
        var toEncode = method + "\n" + prefix + url + '\n' + query + '\n' + gen_hash + '\n' + stamp
        let encoded = crypto.createHmac('sha512', this.getSecret()).update(toEncode).digest("hex").toString()
        return encoded
    }

    getDepositAddress(currency)
    {
        return new Promise((reso, err) => {
            const currentTimestamp = Math.trunc(Date.now() / 1000)
            var query_param = 'currency=' + currency
            const payload_param = ""
            const method = 'GET'
            const host = "https://api.gateio.ws"
            const prefix = "/api/v4"
            const url = "/wallet/deposit_address"
            var urlPlusParam = host + prefix + url
            if(query_param)
                urlPlusParam += '?' + query_param
            
            axios.get(urlPlusParam, {
            headers: {
                "KEY":this.getKey(),
                "Timestamp":currentTimestamp,
                "SIGN":this.getSign(method, prefix, url, query_param, payload_param, currentTimestamp)
            }
            }).then(res => {
                reso(res.data)
            }).catch(e => { 
                err(e)
            })
        })
    }

    getWithdrawFee(currency){
        return new Promise((reso, err) => {
            const currentTimestamp = Math.trunc(Date.now() / 1000)
            var query_param = 'currency=' + currency
            const payload_param = ""
            const method = 'GET'
            const host = "https://api.gateio.ws"
            const prefix = "/api/v4"
            const url = "/wallet/withdraw_status"
            var urlPlusParam = host + prefix + url
            if(query_param)
                urlPlusParam += '?' + query_param
            
            axios.get(urlPlusParam, {
            headers: {
                "KEY":this.getKey(),
                "Timestamp":currentTimestamp,
                "SIGN":this.getSign(method, prefix, url, query_param, payload_param, currentTimestamp)
            }
            }).then(res => {
                reso(res.data)
            }).catch(e => { 
                err(e)
            })
        })
    }
}

module.exports = Gateio // 👈 Export class