'use strict';

const TYPES = require('tedious').TYPES;

class SqlDbItinerary{
    constructor(sqlDbClient) {
        this.sqlDbClient = sqlDbClient;
    };
    
    async findItinerary(recordLocator) {
        var result = await this.sqlDbClient.Execute("GetItineraryByRecordLocatorId", function(request) {
            request.addParameter('RecordLocatorP', TYPES.VarChar, recordLocator)
        });

        if ( result != undefined ) {
            return result[0];
        }
        
        return result;
    }

    async getItinerary(itineraryId) {
        itineraryId = this.sqlDbClient.ensureCartGuid(itineraryId);
        var result = await this.sqlDbClient.Execute("GetItineraryById", function(request) {
            request.addParameter('IdP', TYPES.VarChar, itineraryId)
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
            request.addParameter('IdP', TYPES.VarChar, itineraryId);
            request.addParameter('DepartingFlightP', TYPES.Int, DepartingFlight);
            request.addParameter('ReturningFlightP', TYPES.Int, ReturningFlight);
            request.addParameter('CarReservationP', TYPES.Int, CarReservation);
            request.addParameter('CarReservationDurationP', TYPES.Float, CarReservationDuration);
            request.addParameter('HotelReservationP', TYPES.Int, HotelReservation);
            request.addParameter('HotelReservationDurationP', TYPES.Float, HotelReservationDuration);
            request.addParameter('RecordLocatorP', TYPES.VarChar, itinerary.RecordLocator);
            request.addParameter('PurchasedOnP', TYPES.DateTimeOffset, new Date(itinerary.PurchasedOn));
        });
    }
};


module.exports = SqlDbItinerary;
