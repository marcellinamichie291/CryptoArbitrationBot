bu = require("./Burse")
const axios = require('axios');
const fse = require('fs-extra');
const crypto = require('crypto');

class Mexc extends(bu){
    
    constructor()
    {
        super()
    }

    getKey(){
        return process.env.MEXC_KEY
    }
  
    getSecret(){
        return process.env.MEXC_SECRET
    }

    parsePairs() {
       // logger.verbose("parsePairs Mexc")

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
          logger.verbose("Mexc found pairs: " + res.data.data.length);
        })
        .catch(error => {
          console.error(error);
        });
    }

    getTickers() {
       // logger.verbose("getTickers Mexc")
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
       // logger.verbose("getTicker Mexc")
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
       // logger.verbose("getDepth Mexc")
        var asksDepth = new Array();
        var bidsDepth = new Array();
        return new Promise((resolve, reject) => {
            var getDepthRequest = "https://www.mexc.com/open/api/v2/market/depth?symbol="
            getDepthRequest += pair
            getDepthRequest += "&depth="
            getDepthRequest += precision
            axios.get(getDepthRequest)
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
            if(currentDatetimeTs - this.lastCurrenciesUpdate < 10000)
                reject("RECENTLY REFRESHED")

            this.currencies = []
            axios.get('https://www.mexc.com/open/api/v2/market/coin/list')
            .then(res => {
                for(const currency of res.data.data)
                {
                    for(const coin of currency.coins)
                    {
                        try {
                            if(coin.chain === undefined)
                                continue
                            var res = super.parseChainName(coin.chain)
                            this.currencies.push({currency: currency.currency, chain:res, withdraw: coin.is_withdraw_enabled, deposit: coin.is_deposit_enabled, withdraw_fee: coin.fee})
                        } catch (error) {
                        }
                    }
                }
                this.lastCurrenciesUpdateTs = Date.now();
                resolve(this.currencies)
            })
            .catch(error => {
                reject("FAILED TO GET " + this.constructor.name + " CURRENCIES INFO.")
            });
        })
    }

    getSign(timestamp, query)
    {
        return crypto.createHmac('sha256', this.getSecret()).update( this.getKey() + timestamp + query).digest("hex").toString()    
    }

    getBalance()
    {
        return new Promise((reso, err) => {
            const array = new Array()
            const baseUrl = "https://www.mexc.com"
            const stemp = new Date().getTime().toString()
            const path = "/open/api/v2/account/info"
            axios.get(baseUrl + path, {
                headers: {
                    'Content-Type':'application/json',
                    "ApiKey":this.getKey(),
                    "Request-Time":stemp,
                    "Signature":this.getSign(stemp, '')
                }
            }).then(res => {
                Object.keys(res.data.data).forEach(function(key) {
                    var val = res.data.data[key];
                    val.currency = key
                    array.push(val)
                  });
                reso(array)
            }).catch(e => { 
                err(e)
            })
        })
    }

    getDepositAddress(currency)
    {
        return new Promise((reso, err) => {
            const baseUrl = "https://www.mexc.com"
            const stemp = new Date().getTime().toString()
            //const path = "/open/api/v2/account/info"
            const query = "currency=" + currency
            const path = "/open/api/v2/asset/deposit/address/list?" + query
            //const str = this.getKey() + stemp + query;
            //const path = "/open/api/v2/market/api_symbols"
            axios.get(baseUrl + path, {
                headers: {
                    'Content-Type':'application/json',
                    "ApiKey":this.getKey(),
                    "Request-Time":stemp,
                    "Signature":this.getSign(stemp, query)
                }
            }).then(res => {
                reso(res.data)
            }).catch(e => { 
                err(e)
            })
        })
    }

    getWithdrawFee(currency)
    {
        return new Promise(async(resolve, reject) => {

            await this.onRefreshCurrenciesTick()

            for(const curr of this.currencies)
            {
                if(curr.currency === currency)
                {
                    resolve({withdraw_fee:curr.withdraw_fee})
                }
            }
            reject("NOT FOUND")
        })
    }


    withdraw(currency, amount, address, address_memo, chain="BEP-20")
    {
        return new Promise((reso, err) => {
            const url = "https://www.mexc.com/open/api/v2/asset/withdraw"
            const stemp = new Date().getTime().toString()
            const body = {
                "currency":currency,
                "amount":amount,
                "address":address += address_memo?":"+address_memo:"",
                "chain":chain
            }
            const header = {
                'Content-Type':'application/json',
                "ApiKey":this.getKey(),
                "Request-Time":stemp,
                "Signature":this.getSign(stemp, JSON.stringify(body))
            }
            axios.post(url, body, {
                headers: header
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
            const url = "https://www.mexc.com/open/api/v2/order/place"
            const stemp = new Date().getTime().toString()
            const body = {
                'symbol':pair,
                'price': price,
                'quantity':amount,
                'trade_type': buy?"ASK":"BID",
                'order_type':"LIMIT_ORDER"
            }
            const sign = this.getSign(stemp, JSON.stringify(body))
            const header = {
                'Content-Type':'application/json',
                "ApiKey":this.getKey(),
                "Request-Time":stemp,
                "Signature":sign
            }
            console.log(body)
            console.log(header)
            axios.post(url, body, {
                headers: header
            }).then(res => {
                reso(res.data)
            }).catch(e => { 
                err(e.response.data)
            })
        })
    }
}

module.exports = Mexc // 👈 Export class