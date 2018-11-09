const EventGridClient  = require('azure-eventgrid');
const EventGridManagementClient = require("azure-arm-eventgrid");
const msRestAzure = require('ms-rest-azure');
const uuid = require('uuid/v4');

class PurchaseServiceEventGrid {
    constructor(contosoConfig, dataAccess) {
        this.contosoConfig = contosoConfig;
    }

    async init() {
        // var credentials = await msRestAzure.loginWithAppServiceMSI({resource: 'https://management.azure.com/'});
        var credentials = await msRestAzure.loginWithServicePrincipalSecret("9f46a7d6-3aa4-4612-a91f-24be65970ad8", "$.P=2*-:$)/#}{{#$/$;1%#![k_H(.[=(=#;^^+*}([$r!*.)$-=W/?{|_)", "microsoft.onmicrosoft.com");
        var EGMClient = new EventGridManagementClient(credentials, this.contosoConfig.subscriptionId);
        var topicKeys = await EGMClient.topics.listSharedAccessKeys(this.contosoConfig.resourceGroupName, this.contosoConfig.servicesMiddlewareAccountName);
        var topicCreds = new msRestAzure.TopicCredentials(topicKeys.key1);
        this.eventGridService = new EventGridClient(topicCreds);
        this.topicHostName = this.contosoConfig.servicesMiddlewareAccountName + "." + this.contosoConfig.azureRegion + "-1.eventgrid.azure.net";
    }

    async SendForProcessing(cartId, purchasedOn) {
        let event = [
                        {
                            id: uuid(),
                            subject: 'PurchaseItinerary',
                            dataVersion: '1.0',
                            eventType: 'ContosoTravel.Web.Application.Messages.PurchaseItineraryMessage',
                            eventTime: new Date(),
                            data: {cartId: cartId, purchasedOn: new Date(purchasedOn).toISOString().replace('Z',new Date(purchasedOn).getUTCOffset().replace('00', ':00')) }
                        }
                    ];
        await this.eventGridService.publishEvents(this.topicHostName, event);
    }
}

module.exports = PurchaseServiceEventGrid;