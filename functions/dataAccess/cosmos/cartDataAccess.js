'use strict';

const CosmosHelper = require('./cosmosHelper');
const uuid = require('uuid/v4');

class CosmosDbCart{
    constructor(cosmosClient, contosoConfig) {
        this.contosoConfig = contosoConfig;
        this.cosmosClient = cosmosClient;    
    };

    async init() {
        this.cosmosDbClient = new CosmosHelper(this.cosmosClient, this.contosoConfig, "Carts");
        await this.cosmosDbClient.init();
    };
    
    async getCart(cartId) {
        var results = await this.cosmosDbClient.findById(cartId);
        return results;
    }

    async upsertCartFlights(cartId, departingFlightId, returningFlightId) {
        var cart = undefined;
        
        if ( cartId != undefined ) {
            cart = await this.getCart(cartId);
        }

        if ( cart == undefined ) {
            cart = this.newCart();
        }

        cart.DepartingFlight = departingFlightId;
        cart.ReturningFlight = returningFlightId;

        await this.cosmosDbClient.persist(cart);
        return cart;
    }
    
    async upsertCartCar(cartId, carId, numberOfDays) {
        var cart = undefined;
        
        if ( cartId != undefined ) {
            cart = await this.getCart(cartId);
        }

        if ( cart == undefined ) {
            cart = this.newCart();
        }

        cart.CarReservation = carId;
        cart.CarReservationDuration = numberOfDays;

        await this.cosmosDbClient.persist(cart);
        return cart;
    }
    
    async upsertCartHotel(cartId, hotelId, numberOfDays) {
        var cart = undefined;
        
        if ( cartId != undefined ) {
            cart = await this.getCart(cartId);
        }

        if ( cart == undefined ) {
            cart = this.newCart();
        }

        cart.HotelReservation = hotelId;
        cart.HotelReservationDuration = numberOfDays;

        await this.cosmosDbClient.persist(cart);
        return cart;
    }

    async deleteCart(cartId) {
        var cart = await this.getCart(cartId);
        await this.cosmosDbClient.container.item(cartId).delete(cart);
    }
        
    newCart() {
        var newId = uuid().replace( /\-/g, '');
        var cart = { id: newId, Id: newId };
        return cart;
    }
};

module.exports = CosmosDbCart;
