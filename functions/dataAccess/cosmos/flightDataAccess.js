'use strict';

const CosmosHelper = require('./cosmosHelper');

class CosmosDbFlight{
    constructor(cosmosClient, contosoConfig) {
        this.contosoConfig = contosoConfig;
        this.cosmosClient = cosmosClient;    
    };

    async init() {
        this.cosmosDbClient = new CosmosHelper(this.cosmosClient, this.contosoConfig, "Flights");
        await this.cosmosDbClient.init();
    };
    
    async findFlights(departingFrom, arrivingAt, desiredTime, offset) {
        var epochTimeStart = Math.floor((new Date(desiredTime).addHours(-3).valueOf())/ 1000);
        var epochTimeEnd = Math.floor((new Date(desiredTime).addHours(3).valueOf())/ 1000);
        var results = await this.cosmosDbClient.find("SELECT * FROM Flights f WHERE f.DepartingFrom = '" + departingFrom + "' AND f.ArrivingAt = '" + arrivingAt + "' AND f.DepartureTimeEpoc >= " + epochTimeStart.toString() + " AND f.DepartureTimeEpoc <= " + epochTimeEnd.toString());
        return results;
    }

    async findFlight(flightId) {
        var result = await this.cosmosDbClient.findById(flightId);
        return result;
    }
};

module.exports = CosmosDbFlight;
