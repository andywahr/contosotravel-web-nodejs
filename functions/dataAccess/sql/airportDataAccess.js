'use strict';

const TYPES = require('tedious').TYPES;

class SqlDbAirport{
    constructor(sqlDbClient) {
        this.sqlDbClient = sqlDbClient;
    };

    async init() {
        this.allAirports = await this.sqlDbClient.Execute("GetAllAirports", undefined);
    };
    
    async getAll() {
        return await this.allAirports;
    }

    async findByCode(airportCode) {
        var result = await this.sqlDbClient.Execute("FindAirportByCode", function(request) {
            request.addParameter('AirportCode', TYPES.Char, airportCode)
        });

        if ( result != undefined ) {
            return result[0];
        }
        
        return result;
    }
};

module.exports = SqlDbAirport;
