class FulfillmentService{
    
    constructor(dataAccess) {
        this.dataAccess = dataAccess;
        this.safeCharacters = Array.from("234679CDFGHJKMNPRTWXYZ");
    }

    async Purchase(cartId, purchasedOn) {

        console.log("Passed in CartId:" + cartId + " purchaseOn:" + purchasedOn);

        var itinerary = await this.dataAccess.cart.getCart(cartId);
        itinerary.PurchasedOn = purchasedOn;

        console.log("Purchasing: " + JSON.stringify(itinerary));

        var recordLocator = "";
        for ( var ii = 0; ii < 6; ii++ ) {
            recordLocator += this.safeCharacters[Math.floor(Math.random() * 21)];
        }

        itinerary.RecordLocator = recordLocator;

        await this.dataAccess.itinerary.upsertItinerary(itinerary);

        return recordLocator;
    }
}

module.exports = FulfillmentService;