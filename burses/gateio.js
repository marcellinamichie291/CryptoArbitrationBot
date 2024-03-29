bu = require("./Burse")
const axios = require('axios');
const fse = require('fs-extra');
const crypto = require('crypto');

class Gateio extends(bu){

    delistPairs = 
        ["HERO_USDT"]

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

                    if(this.delistPairs.some((item) => {
                        return item === ticker.currency_pair
                    }))
                        continue
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
                    if(this.delistPairs.some((item) => {
                        return item === ticker.currency_pair
                    }))
                    {
                        reject("is delisted")
                    }
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

    getBalance()
    {
        return new Promise((reso, err) => {
            const currentTimestamp = Math.trunc(Date.now() / 1000)
            var query_param = ''
            const payload_param = ""
            const method = 'GET'
            const host = "https://api.gateio.ws"
            const prefix = "/api/v4"
            const url = "/spot/accounts"
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
                reso({withdraw_fee:res.data[0].withdraw_fix})
            }).catch(e => { 
                err(e)
            })
        })
    }

    withdraw(currency, amount, address, address_memo, chain="BSC")
    {
        return new Promise((reso, err) => {
            const currentTimestamp = Math.trunc(Date.now() / 1000)
            const method = 'POST'
            const host = "https://api.gateio.ws"
            const prefix = "/api/v4"
            const url = "/withdrawals"
            const urlPlusParam = host + prefix + url

            const body = { 
                "currency":currency,
                "amount":amount,
                "address":address,
                "address_memo":address_memo,
                "chain":chain
            }
            const header = {
                'Accept':'application/json',
                'Content-Type':'application/json',
                'KEY':this.getKey(),
                'Timestamp':currentTimestamp,
                'SIGN':this.getSign(method, prefix, url, "", JSON.stringify(body), currentTimestamp)
            }
            axios.post(urlPlusParam, body,{
                headers:header
            }).then(res => {
                reso(res.data)
            }).catch(e => { 
                err(e.response.data)
            })
        })
    }

    createOrder(pair, buy, price, amount)
    {
        return new Promise((reso, err) => {
            const currentTimestamp = Math.trunc(Date.now() / 1000)
            const method = 'POST'
            const host = "https://api.gateio.ws"
            const prefix = "/api/v4"
            const url = "/spot/orders"
            const urlPlusParam = host + prefix + url
            //const sign = this.getSign("POST", "/api/v4", "/spot/orders", "", JSON.stringify(jsonBod), currentTimestam)

            const jsonBody =
            { 
                currency_pair:pair,
                side:buy?"buy":"sell",
                amount:amount,
                price:price
            }

            const sign = this.getSign(method, prefix, url, "", JSON.stringify(jsonBody), currentTimestamp)

            const header = {
                'Accept':'application/json',
                'Content-Type':'application/json',
                'KEY':this.getKey(),
                'Timestamp':currentTimestamp,
                'SIGN':sign//this.getSign(method, prefix, url, "", JSON.stringify(jsonBody), currentTimestamp)
            }

            axios.post(urlPlusParam, jsonBody,{
                headers:header
            }).then(res => {
                reso(res.data)
            }).catch(e => { 
                err(e.response.data)
            })
        })
    }
}

module.exports = Gateio // 👈 Export class