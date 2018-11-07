'use strict';

const CosmosHelper = require('./cosmosHelper');

class CosmosDbAirport{
    constructor(cosmosClient, contosoConfig) {
        this.contosoConfig = contosoConfig;
        this.cosmosClient = cosmosClient;    
    };

    async init() {
        this.cosmosDbClient = new CosmosHelper(this.cosmosClient, this.contosoConfig, "Airports");
        await this.cosmosDbClient.init();
        this.allAirports = await this.cosmosDbClient.find();
    };
    
    async getAll() {
        return this.allAirports;
    }

    async findByCode(airportCode) {
        var result = this.cosmosDbClient.findById(airportCode);
        return result;
    }
};

module.exports = CosmosDbAirport;
