const FulfillmentService =  require('../services/fulfillmentService');
const DataAccess = require('../dataAccess/dataAccessProvider');

var config = require('../config/keyVault');
var dataAccess;

config.loadConfig(process.env.KeyVaultAccountName).then(function (contosoConfig) {
    dataAccess = DataAccess.getDataProvider(contosoConfig);
});

module.exports = async function(context, mySbMsg) {
    var fulfillmentService = new FulfillmentService(dataAccess);
    var purchaseItineraryMessage = JSON.parse(mySbMsg);

    context.info("Starting to finalize purchase of " + purchaseItineraryMessage.cartId);
    context.Debug("Calling Purchase method");

    var recordLocator = await fulfillmentService.Purchase(purchaseItineraryMessage.cartId, purchaseItineraryMessage.purchasedOn);

    if (recordLocator == undefined)
    {
        context.error("Finalization purchase of " + purchaseItineraryMessage.cartId + " failed");
        context.done("Finalization purchase of " + purchaseItineraryMessage.cartId + " failed");
    }
    else
    {
        context.info("Record Locator " + recordLocator+ " complete for cart " + purchaseItineraryMessage.cartId);
    }
};