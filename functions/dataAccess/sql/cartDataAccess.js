'use strict';

const TYPES = require('tedious').TYPES;
const uuid = require('uuid/v4');

class SqlDbCart{
    constructor(sqlDbClient) {
        this.sqlDbClient = sqlDbClient;
    };
    
    async getCart(cartId) {
        cartId = this.sqlDbClient.ensureCartGuid(cartId);
        var result = await this.sqlDbClient.Execute("GetCartById",function(request) {
            request.addParameter('IdP', TYPES.VarChar, cartId)
        });

        if ( result != undefined ) {
            return result[0];
        }

        return result;
    }

    async upsertCartFlights(cartId, departingFlightId, returningFlightId) {
        cartId = this.sqlDbClient.ensureCartGuid(cartId);
        departingFlightId = this.sqlDbClient.nullIfZero(departingFlightId);
        returningFlightId = this.sqlDbClient.nullIfZero(returningFlightId);
        if ( cartId == undefined ) {
            cartId = uuid();
        }
        var result = await this.sqlDbClient.Execute("UpsertCartFlights", function(request) {
            request.addParameter('IdP', TYPES.VarChar, cartId);
            request.addParameter('DepartingFlightP', TYPES.Int, departingFlightId);
            request.addParameter('ReturningFlightP', TYPES.Int, returningFlightId);
        });

        var newCart = await this.getCart(cartId);
        return newCart;
    }
    
    async upsertCartCar(cartId, carId, numberOfDays) {
        cartId = this.sqlDbClient.ensureCartGuid(cartId);
        carId = this.sqlDbClient.nullIfZero(carId);
        numberOfDays = this.sqlDbClient.nullIfZero(numberOfDays);
        if ( cartId == undefined ) {
            cartId = uuid();
        }
        var result = await this.sqlDbClient.Execute("UpsertCartCar", function(request) {
            request.addParameter('IdP', TYPES.VarChar, cartId);
            request.addParameter('CarReservationP', TYPES.Int, carId);
            request.addParameter('CarReservationDurationP', TYPES.Float, numberOfDays);
        });

        var newCart = await this.getCart(cartId);
        return newCart;
    }
    
    async upsertCartHotel(cartId, hotelId, numberOfDays) {
        cartId = this.sqlDbClient.ensureCartGuid(cartId);
        hotelId = this.sqlDbClient.nullIfZero(hotelId);
        numberOfDays = this.sqlDbClient.nullIfZero(numberOfDays);
        if ( cartId == undefined ) {
            cartId = uuid();
        }
        var result = await this.sqlDbClient.Execute("UpsertCartHotel", function(request) {
            request.addParameter('IdP', TYPES.VarChar, cartId);
            request.addParameter('HotelReservationP', TYPES.Int, hotelId);
            request.addParameter('HotelReservationDurationP', TYPES.Float, numberOfDays);
        });

        var newCart = await this.getCart(cartId);
        return newCart;
    }

    async deleteCart(cartId) {
        cartId = this.sqlDbClient.ensureCartGuid(cartId);
        await this.sqlDbClient.Execute("DeleteCart", function(request) {
            request.addParameter('IdP', TYPES.VarChar, cartId)
        });
    }
};

module.exports = SqlDbCart;
