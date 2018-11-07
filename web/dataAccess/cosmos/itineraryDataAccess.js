'use strict';

const CosmosHelper = require('./cosmosHelper');

class CosmosDbItinerary{
    constructor(cosmosClient, contosoConfig) {
        this.contosoConfig = contosoConfig;
        this.cosmosClient = cosmosClient;    
    };

    async init() {
        this.cosmosDbClient = new CosmosHelper(this.cosmosClient, this.contosoConfig, "Itineraries");
        await this.cosmosDbClient.init();
    };
    
    async findItinerary(recordLocator) {
        var results = await this.cosmosDbClient.find("SELECT * FROM Itineraries i WHERE i.RecordLocator == '" + recordLocator + "'");
        return results;
    }

    async getItinerary(itineraryId) {
        var result = this.cosmosDbClient.findById(itineraryId);
        return result;
    }

    async upsertItinerary(itinerary) {
        await this.cosmosDbClient.persist(itinerary);
    }
};


module.exports = CosmosDbItinerary;
