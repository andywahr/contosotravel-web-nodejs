class FulfillmentService{
    
    constructor(dataAccess) {
        this.dataAccess = dataAccess;
        this.safeCharacters = Array.from("234679CDFGHJKMNPRTWXYZ");
    }

    async Purchase(cartId, purchasedOn) {
        var itinerary = await this.dataAccess.cart.getCart(cartId);
        itinerary.PurchasedOn = purchasedOn;

        var recordLocator = "";
        for ( var ii = 0; ii < 6; ii++ ) {
            recordLocator += this.safeCharacters[Math.floor(Math.random() * 21)];
        }

        itinerary.RecordLocator = recordLocator;

        await this.dataAccess.itinerary.upsertItinerary(itinerary);
    }
}

module.exports = FulfillmentService;