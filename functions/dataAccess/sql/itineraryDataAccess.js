'use strict';

const TYPES = require('tedious').TYPES;

class SqlDbItinerary{
    constructor(sqlDbClient) {
        this.sqlDbClient = sqlDbClient;
    };
    
    async findItinerary(recordLocator) {
        var result = await this.sqlDbClient.Execute("GetItineraryByRecordLocatorId", function(request) {
            request.addParameter('RecordLocator', TYPES.VarChar, recordLocator)
        });

        if ( result != undefined ) {
            return result[0];
        }
        
        return result;
    }

    async getItinerary(itineraryId) {
        itineraryId = this.sqlDbClient.ensureCartGuid(itineraryId);
        var result = await this.sqlDbClient.Execute("GetItineraryById", function(request) {
            request.addParameter('Id', TYPES.VarChar, itineraryId)
        });

        if ( result != undefined ) {
            return result[0];
        }
        
        return result;
    }

    async upsertItinerary(itinerary) {
        var itineraryId = this.sqlDbClient.ensureCartGuid(itinerary.Id);
        var DepartingFlight = this.sqlDbClient.nullIfZero(itinerary.DepartingFlight);
        var ReturningFlight = this.sqlDbClient.nullIfZero(itinerary.ReturningFlight);
        var CarReservation = this.sqlDbClient.nullIfZero(itinerary.CarReservation);
        var CarReservationDuration = this.sqlDbClient.nullIfZero(itinerary.CarReservationDuration);
        var HotelReservation = this.sqlDbClient.nullIfZero(itinerary.HotelReservation);
        var HotelReservationDuration = this.sqlDbClient.nullIfZero(itinerary.HotelReservationDuration);

        await this.sqlDbClient.Execute("UpsertItinerary", function(request) {
            request.addParameter('Id', TYPES.VarChar, itineraryId);
            request.addParameter('DepartingFlight', TYPES.Int, DepartingFlight);
            request.addParameter('ReturningFlight', TYPES.Int, ReturningFlight);
            request.addParameter('CarReservation', TYPES.Int, CarReservation);
            request.addParameter('CarReservationDuration', TYPES.Float, CarReservationDuration);
            request.addParameter('HotelReservation', TYPES.Int, HotelReservation);
            request.addParameter('HotelReservationDuration', TYPES.Float, HotelReservationDuration);
            request.addParameter('RecordLocator', TYPES.VarChar, itinerary.RecordLocator);
            request.addParameter('PurchasedOn', TYPES.DateTimeOffset, new Date(itinerary.PurchasedOn));
        });
    }
};


module.exports = SqlDbItinerary;
