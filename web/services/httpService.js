
const URL = require('url').URL;
const request = require('request');

class HttpService {
    constructor(contosoConfig, dataAccess) {
        this.uri = contosoConfig.serviceFQDN;
    }

    async init() {
    }

    SendForProcessing(cartId, purchasedOn) {
        var message = {cartId: cartId, purchasedOn: new Date(purchasedOn).toISOString() };
        
        return new Promise(
            (resolve, reject) => {
                var options = {
                    url: this.uri,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    auth: {
                        'bearer': 'bearerToken'
                    },
                    body: JSON.stringify(message)
                };

                request.post(options, function (err, resp, body) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        );
    }
}


module.exports = HttpService;