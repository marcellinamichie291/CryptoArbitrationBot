bu = require("./Burse")
const axios = require('axios');
const fse = require('fs-extra');
const he = require('../helper')
const crypto = require('crypto');

class Bitmart extends(bu){

    delistPairs = 
        ["HERO_USDT"]

    constructor()   
    {
        super()
    }

    getKey(){
        return process.env.BITMART_KEY
    }
  
    getSecret(){
        return process.env.BITMART_SECRET
    }

    getMemo(){
        return process.env.BITMART_MEMO
    }

    parsePairs() {
        //logger.verbose("parsePairs Bitmart")

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
            logger.verbose("Bitmart found pairs: " + res.data.data.symbols.length);
        })
        .catch(error => {
            console.error(error);
        });

    } 

    getTickers() {   
        //logger.verbose("getTickers Bitmart")
        return new Promise((resolve, reject) => {
            axios
            .get('https://api-cloud.bitmart.com/spot/v1/ticker')
            .then(res => {
                //console.log(`statusCode: ${res.status}`);
                //fse.outputJsonSync('./tickers_bitmart.json', res.data);
                for(const ticker of res.data.data.tickers)
                {
                    if(this.delistPairs.some((item) => {
                        return item === ticker.symbol
                    }))
                        continue
                    this.prices.push({pair: ticker.symbol, last_price: ticker.last_price})
                }
                //console.dir(this.prices)
                //var roughObjSize = JSON.stringify(res.data.data).length;
                //logger.verbose(JSON.stringify(res).data.data.tickers.length);
                resolve(this.constructor.name)
            })
            .catch(error => {
                console.error(error);
                reject(error)
            });
        })
    }

    getTicker(pair) {   
        //logger.verbose("getTicker Bitmart")
        return new Promise((resolve, reject) => {
            var tickerRequest = 'https://api-cloud.bitmart.com/spot/v1/ticker?symbol='
            tickerRequest += pair
            axios
            .get(tickerRequest)
            .then(res => {
                var pair;
                for(const ticker of res.data.data.tickers)
                {
                    if(this.delistPairs.some((item) => {
                        return item === ticker.symbol
                    }))
                    {
                        reject("is delisted")
                    }
                    pair = {burse: this.constructor.name, pair: ticker.symbol, last_price: ticker.last_price}
                }

                resolve(pair)
            })
            .catch(error => {
                console.error(pair);
                reject(error)
            });
        })
    }

    getTickersTimeoutInterval() {
        return 3000;
    }

    getDepth(pair, precision = 5) {
        //logger.verbose("getDepth Bitmart")
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
                for(const ask of res.data.data.sells) {
                    asksDepth.push({price: ask.price, amount: ask.total})
                }
                for(const bid of res.data.data.buys) {
                    bidsDepth.push({price: bid.price, amount: bid.total})
                }
                var depthOfPair = {pair: pair, burse: this.constructor.name, asks: asksDepth, bids: bidsDepth}
                resolve(depthOfPair)
            })
            .catch(error => {
                reject("FAILED TO GET DEPTH FOR BURSE: " + this.constructor.name + ", PAIR: " + pair + ", ERROR: " + error)
            });
        })  
    }

    onRefreshCurrenciesTick()
    {
        return new Promise((resolve, reject) => {
            const currentDatetimeTs = Date.now()
            if(currentDatetimeTs - this.lastCurrenciesUpdate < 6000)
                reject("RECENTLY REFRESHED")
            
            this.currencies = []
            axios
            .get('https://api-cloud.bitmart.com/account/v1/currencies')
            .then(res => {
                for(const currency of res.data.data.currencies)
                {
                    try {
                        if(currency.network === undefined)
                            continue
                        var res = super.parseChainName(currency.network)
                        this.currencies.push({currency: currency.currency, chain:res, withdraw: currency.withdraw_enabled, deposit: currency.deposit_enabled})
                    
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

    // async getCurrencyInfo(pair)
    // {
    //     if(pair.includes("_USDT") === false)
    //         throw "PAIR DOES NOT CONTAINS _USD"
    //     pair = pair.replace("_USDT", "")
        
    //     for(const currency of this.currencies)
    //     {
    //         if(currency.currency === pair)
    //         {
    //             return currency
    //         }
    //     }
    //     throw "CANT FIND " + pair
    // }

    getSign(query, timestamp)
    {
        var toEncode = timestamp + "#" + this.getMemo() + '#' + query
        let encoded = crypto.createHmac('sha256', this.getSecret()).update(toEncode).digest("hex").toString()
        return encoded
    }

    getDepositAddress(currency)
    {
        return new Promise((reso, err) => {
            const currentTimestamp = Math.trunc(Date.now())
            var query_param = 'currency=' + currency
            var urlPlusParam = "https://api-cloud.bitmart.com/account/v1/deposit/address"
            if(query_param)
                urlPlusParam += '?' + query_param
            
            axios.get(urlPlusParam, {
            headers: {
                "X-BM-KEY":this.getKey(),
                "X-BM-TIMESTAMP":currentTimestamp,
                "X-BM-SIGN":this.getSign(query_param, currentTimestamp)
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
            const currentTimestamp = Math.trunc(Date.now())
            var query_param = 'currency=' + currency
            var urlPlusParam = "https://api-cloud.bitmart.com/account/v1/withdraw/charge"
            if(query_param)
                urlPlusParam += '?' + query_param
            
            axios.get(urlPlusParam, {
            headers: {
                "X-BM-KEY":this.getKey(),
                "X-BM-TIMESTAMP":currentTimestamp,
                "X-BM-SIGN":this.getSign(query_param, currentTimestamp)
            }
            }).then(res => {
                reso({withdraw_fee:res.data.data.withdraw_fee})
            }).catch(e => { 
                err(e)
            })
        })
    }
}

module.exports = Bitmart // 👈 Export class