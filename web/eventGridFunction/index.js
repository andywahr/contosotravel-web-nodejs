const FulfillmentService =  require('../services/fulfillmentService');
const DataAccess = request('./dataAccess/dataAccessProvider');

var config = require('../config/keyVault');
var contosoConfig = await config.loadConfig(process.env.KeyVaultAccountName);
dataAccess = DataAccess.getDataProvider(contosoConfig);

module.exports = async function (context, req) {
    var fulfillmentService = new FulfillmentService(dataAccess);
    var purchaseItineraryMessage = req.body;

    context.info("Starting to finalize purchase of " + purchaseItineraryMessage.cartId);
    context.Debug("Calling Purchase method");

    var recordLocator = await fulfillmentService.Purchase(purchaseItineraryMessage.cartId, purchaseItineraryMessage.purchasedOn);

    if (recordLocator == undefined)
    {
        context.error("Finalization purchase of " + purchaseItineraryMessage.cartId + " failed");
        context.res = {
            status: 400,
            body: "Finalization purchase of " + purchaseItineraryMessage.cartId + " failed"
        };
    }
    else
    {
        context.info("Record Locator " + recordLocator+ " complete for cart " + purchaseItineraryMessage.cartId);
        context.res = { body: recordLocator };
    }
};