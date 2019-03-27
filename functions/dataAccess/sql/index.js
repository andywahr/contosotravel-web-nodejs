'use strict';

const AirportDBAdapter = require('./airportDataAccess');
const CarDBAdapter = require('./carDataAccess');
const SqlHelper = require('./sqlHelper');
const MySqlHelper = require('./mysqlHelper');
const FlightDBAdapter = require('./flightDataAccess');
const HotelDBAdapter = require('./hotelDataAccess');
const CartDBAdapter = require('./cartDataAccess');
const ItineraryDBAdapter = require('./itineraryDataAccess');


class SqlDataAdapter{
    constructor(contosoConfig) {
        this.contosoConfig = contosoConfig;  
    };

    async init() {
        if ( this.contosoConfig.dataType == 'SQL' ) {
            this.sqlDbClient = new SqlHelper(this.contosoConfig);
        } else if ( this.contosoConfig.dataType == 'MySQL' ) {
            this.sqlDbClient = new MySqlHelper(this.contosoConfig);
        }

        await this.sqlDbClient.init();

        this.airport = new AirportDBAdapter(this.sqlDbClient);
        this.car = new CarDBAdapter(this.sqlDbClient);
        this.flight = new FlightDBAdapter(this.sqlDbClient);
        this.hotel = new HotelDBAdapter(this.sqlDbClient);
        this.cart = new CartDBAdapter(this.sqlDbClient);
        this.itinerary = new ItineraryDBAdapter(this.sqlDbClient);

        await this.airport.init();
    };
};

module.exports = SqlDataAdapter;