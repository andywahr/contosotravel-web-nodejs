'use strict';

const TYPES = require('tedious').TYPES;

class SqlDbFlight{
    constructor(sqlDbClient) {
        this.sqlDbClient = sqlDbClient;
    };
     
    async findFlights(departingFrom, arrivingAt, desiredTime, offset) {
        var results = await this.sqlDbClient.Execute("FindFlights", function(request) {
            request.addParameter('DepartingFromP', TYPES.Char, departingFrom);
            request.addParameter('ArrivingAtP', TYPES.Char, arrivingAt);
            request.addParameter('DesiredTimeP', TYPES.DateTimeOffset, new Date(desiredTime));
            request.addParameter('SecondsOffsetP', TYPES.Int, offset * 60 * 60);
        });
        return results;
    }

    async findFlight(flightId) {
        var result = await this.sqlDbClient.Execute("FindFlightById", function(request) {
            request.addParameter('IdP', TYPES.Int, flightId)
        });

        if ( result != undefined ) {
            return result[0];
        }

        return result;
    }
};

module.exports = SqlDbFlight;
