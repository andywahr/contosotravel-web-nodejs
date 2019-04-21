'use strict';

const CosmosHelper = require('./cosmosHelper');

class CosmosDbHotel{
    constructor(cosmosClient, contosoConfig) {
        this.contosoConfig = contosoConfig;
        this.cosmosClient = cosmosClient;    
    };

    async init() {
        this.cosmosDbClient = new CosmosHelper(this.cosmosClient, this.contosoConfig, "Hotels", [ "/Location", "/StartingTimeEpoc", "/EndingTimeEpoc" ]);
        await this.cosmosDbClient.init();
    };
    
    async findHotels(location, startDate) {
        var epochTimeStart = Math.floor((new Date(startDate).valueOf())/1000);
        var results = await this.cosmosDbClient.find("SELECT * FROM Hotels h WHERE h.Location = '" + location + "' AND h.StartingTimeEpoc <= " + epochTimeStart.toString() + " AND h.EndingTimeEpoc >= " + epochTimeStart.toString());
        return results;
    }

    async findHotel(hotelId) {
        var result = await this.cosmosDbClient.findById(hotelId);
        return result;
    }
};

module.exports = CosmosDbHotel;
