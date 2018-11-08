
var fulfillmentService = require('./fulfillmentService');

class MonolithService {
    constructor(cotosoConfig, dataAccess) {
        this.service = new fulfillmentService(dataAccess);
    }

    async SendForProcessing(cartId, purchasedOn) {
        await new Promise(resolve => setTimeout(resolve, (Math.floor(Math.random() * 30000))));
        await this.service.Purchase(cartId, purchasedOn);
    }
}

module.exports = MonolithService;