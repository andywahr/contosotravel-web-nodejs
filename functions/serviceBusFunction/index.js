
const appInsights = require("applicationinsights");
appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY);
appInsights.start();

const FulfillmentService =  require('../services/fulfillmentService');
const DataAccess = require('../dataAccess/dataAccessProvider');

var config = require('../config/keyVault');
var keyVaultName = process.env.KeyVaultAccountName;

let getFulfillmentServicePromise = new Promise(async function(resolve, reject) {
    var contosoConfig = await config.loadConfig(keyVaultName);
    var dataAccess = DataAccess.getDataProvider(contosoConfig);
    var fulfillmentService = new FulfillmentService(dataAccess);
    await dataAccess.init();
    resolve(fulfillmentService);
});

module.exports = async function(context, purchaseItineraryMessage) {
    return new Promise(async function(resolve, reject) {
        getFulfillmentServicePromise.then(async function (fulfillmentService) {
            purchaseItineraryMessage.purchasedOn = new Date();
            context.log.info("Starting to finalize purchase of " + purchaseItineraryMessage.cartId + " purchaseOn: " + purchaseItineraryMessage.purchasedOn);

            fulfillmentService.Purchase(purchaseItineraryMessage.cartId, purchaseItineraryMessage.purchasedOn).then(
                function(recordLocator)  {
                    context.log.info("Record Locator " + recordLocator + " complete for cart " + purchaseItineraryMessage.cartId);
                    resolve(recordLocator);
                },
                function(err) {
                    context.log.error("Finalization purchase of " + purchaseItineraryMessage.cartId + " failed: " + err);
                    context.done("Finalization purchase of " + purchaseItineraryMessage.cartId + " failed: " + err);
                    reject(err);
                });
        });
    });
};