'use strict';

const CosmosHelper = require('./cosmosHelper');

class CosmosDbCar{
    constructor(cosmosClient, contosoConfig) {
        this.contosoConfig = contosoConfig;
        this.cosmosClient = cosmosClient;    
    };

    async init() {
        this.cosmosDbClient = new CosmosHelper(this.cosmosClient, this.contosoConfig, "Cars", [ "/Location", "/StartingTimeEpoc", "/EndingTimeEpoc" ]);
        await this.cosmosDbClient.init();
    };
    
    async findCars(location, startDate) {
        var epochTimeStart = Math.floor((new Date(startDate).valueOf())/1000);
        var results = await this.cosmosDbClient.find("SELECT * FROM Cars c WHERE c.Location = '" + location + "' AND c.StartingTimeEpoc <= " + epochTimeStart.toString() + " AND c.EndingTimeEpoc >= " + epochTimeStart.toString());
        return results;
    }

    async findCar(carId) {
        var result = await this.cosmosDbClient.findById(carId);
        return result;
    }
};

module.exports = CosmosDbCar;
