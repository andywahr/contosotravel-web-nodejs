const azureSB = require('azure-sb');

class PurchaseServiceBusService {
    constructor(contosoConfig, dataAccess) {
        this.serviceBusService = azureSB.createServiceBusService(contosoConfig.serviceConnectionString.slice(0,contosoConfig.serviceConnectionString.indexOf('EntityPath')-1));             
    }

    async init() {
    }

    SendForProcessing(cartId, purchasedOn) {
        var message = {
                body: JSON.stringify({cartId: cartId, purchasedOn: new Date(purchasedOn).toISOString().replace('Z',new Date(purchasedOn).getUTCOffset().replace('00', ':00')) })
            };
        
        return new Promise(
            (resolve, reject) => {
                this.serviceBusService.sendQueueMessage("PurchaseItinerary", message, function(error){
                    if(!error){
                        resolve();
                    } else {
                        reject(error);
                    }
                });
            });
    }
}


module.exports = PurchaseServiceBusService;