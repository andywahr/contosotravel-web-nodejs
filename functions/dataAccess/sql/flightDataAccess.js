'use strict';

const TYPES = require('tedious').TYPES;

class SqlDbFlight{
    constructor(sqlDbClient) {
        this.sqlDbClient = sqlDbClient;
    };
    
    async findCars(location, startDate) {
        var results = await this.sqlDbClient.Execute("FindCars", function(request) {
            request.addParameter('Location', TYPES.Char, location);
            request.addParameter('DesiredTime', TYPES.DateTimeOffset, new Date(startDate));
        });
        return this.fixCarTypes(results);
    }
    
    async findFlights(departingFrom, arrivingAt, desiredTime, offset) {
        var results = await this.sqlDbClient.Execute("FindFlights", function(request) {
            request.addParameter('DepartingFrom', TYPES.Char, departingFrom);
            request.addParameter('ArrivingAt', TYPES.Char, arrivingAt);
            request.addParameter('DesiredTime', TYPES.DateTimeOffset, new Date(desiredTime));
            request.addParameter('SecondsOffset', TYPES.Int, offset * 60 * 60);
        });
        return results;
    }

    async findFlight(flightId) {
        var result = await this.sqlDbClient.Execute("FindFlightById", function(request) {
            request.addParameter('Id', TYPES.Int, flightId)
        });

        if ( result != undefined ) {
            return result[0];
        }

        return result;
    }
};

module.exports = SqlDbFlight;
