const CosmosClient = require("@azure/cosmos").CosmosClient;
const AirportDBAdapter = require('./airportDataAccess');
const CarDBAdapter = require('./carDataAccess');
const FlightDBAdapter = require('./flightDataAccess');
const HotelDBAdapter = require('./hotelDataAccess');
const CartDBAdapter = require('./cartDataAccess');
const ItineraryDBAdapter = require('./itineraryDataAccess');


class CosmosDataAdapter{
    constructor(contosoConfig) {
        this.contosoConfig = contosoConfig;
        this.cosmosClient = new CosmosClient({ 
                       // https://andytst1-cosmossql.documents.azure.com:443/
            endpoint: "https://" + contosoConfig.dataAccountName + ".documents.azure.com",
            auth: {
              masterKey: contosoConfig.dataAccountPassword
            }
          });    
    };

    async init() {
        this.airport = new AirportDBAdapter(this.cosmosClient, this.contosoConfig);
        this.car = new CarDBAdapter(this.cosmosClient, this.contosoConfig);
        this.flight = new FlightDBAdapter(this.cosmosClient, this.contosoConfig);
        this.hotel = new HotelDBAdapter(this.cosmosClient, this.contosoConfig);
        this.cart = new CartDBAdapter(this.cosmosClient, this.contosoConfig);
        this.itinerary = new ItineraryDBAdapter(this.cosmosClient, this.contosoConfig);

        await Promise.all([
            this.airport.init(),
            this.car.init(),
            this.flight.init(),
            this.hotel.init(),
            this.cart.init(),
            this.itinerary.init()
        ]);
    };
};

module.exports = CosmosDataAdapter;