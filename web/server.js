
var express = require('express');
var cookieParser = require('cookie-parser')
var ejs = require('ejs');
var http = require('http');
var path = require('path');


var CartDisplayProvider = require('./dataAccess/cartDisplayProvider');
var AirportDisplayProvider = require('./dataAccess/airportDisplayProvider');

var config = require('./config/keyVault');

var configPromise = config.loadConfig("andytst1-keyvault");

var app = express();
var dataAccess = '';
var service = '';
var cartDisplayProvider = '';
var airportDisplayProvider = '';

app.use(express.json()); 
app.use(express.urlencoded());
app.use(cookieParser())

app.set('view engine', 'ejs')
app.set('port', 1500);

app.get('/', function (req, res) {
    res.render('shared/search', {search : {SearchMode: 'Flights',
                                    IncludeEndLocation : true,
                                    StartLocationLabel : "Depart From",
                                    EndLocationLabel : "Return From",
                                    StartDateLabel : "Depart",
                                    EndDateLabel : "Return",
                                    AirPorts : airportDisplayProvider.getAll()
                                }, title: "Find Flights"});    
 });

 app.get('/flights', function (req, res) {
    res.render('shared/search', {search : {SearchMode: 'Flights',
                                    IncludeEndLocation : true,
                                    StartLocationLabel : "Depart From",
                                    EndLocationLabel : "Return From",
                                    StartDateLabel : "Depart",
                                    EndDateLabel : "Return",
                                    AirPorts : airportDisplayProvider.getAll()
                                }, title: "Find Flights"});    
 });

 app.post('/flights/search', function (req, res) {
    var startingFlight = dataAccess.flight.findFlights(req.body.StartLocation, req.body.EndLocation, req.body.StartDate, 3);
    var endingFlight = dataAccess.flight.findFlights(req.body.EndLocation, req.body.StartLocation, req.body.EndDate, 3);

    Promise.all([startingFlight, endingFlight]).then(function(values){

        var departingFlights = airportDisplayProvider.resolveAirportsForAll(values[0]);
        var returningFlights = airportDisplayProvider.resolveAirportsForAll(values[1]);
        res.render('flights/flightResults', {
                                        DepartingFlights: departingFlights,
                                        ReturningFlights: returningFlights
                                    });  

    }).catch(function(error) {
        console.log(error);
      });
 });

 app.post('/flights/purchase', function (req, res) {
    var cartId = req.cookies['CartId'];
     dataAccess.cart.upsertCartFlights(cartId, req.body.SelectedDepartingFlight, req.body.SelectedReturningFlight).then(function(cart) {
 
         if ( cart.Id != cartId ) {
             res.cookie('CartId', cart.Id);
         }

         res.redirect('/cart');
 
     }).catch(function(error) {
         console.log(error);
       });
  });

 app.get('/cars', function (req, res) {
    res.render('shared/search', {search :   {SearchMode: 'Cars',
                                                IncludeEndLocation : false,
                                                StartLocationLabel : "Location",
                                                StartDateLabel : "Pick-Up",
                                                EndDateLabel : "Drop-Off",
                                                AirPorts : airportDisplayProvider.getAll()
                                            }, title: "Find Flights"});    
 });

 app.post('/cars/search', function (req, res) {
    dataAccess.car.findCars(req.body.StartLocation, req.body.StartDate).then(function(cars){
        var duration = ((new Date(req.body.EndDate)) - (new Date(req.body.StartDate))) / (1000 * 60 * 60 * 24);
        res.render('cars/carResults', {
                                        Cars: airportDisplayProvider.resolveAirportsForAll(cars),
                                        NumberOfDays: duration
                                    });  

    }).catch(function(error) {
        console.log(error);
      });
 });

  app.post('/cars/purchase', function (req, res) {
    var cartId = req.cookies['CartId'];
     dataAccess.cart.upsertCartCar(cartId, req.body.SelectedCar, req.body.NumberOfDays).then(function(cart) {
 
         if ( cart.Id != cartId ) {
             res.cookie('CartId', cart.Id);
         }

         res.redirect('/cart');
 
     }).catch(function(error) {
         console.log(error);
       });
  });

 app.get('/hotels', function (req, res) {
        res.render('shared/search', {search : {SearchMode: 'Hotels',
                                                IncludeEndLocation : false,
                                                StartLocationLabel : "Location",
                                                StartDateLabel : "Check-In",
                                                EndDateLabel : "Check-Out",
                                                AirPorts : airportDisplayProvider.getAll()
                                            }, title: "Find Flights"});    
 });

 app.post('/hotels/search', function (req, res) {
    dataAccess.hotel.findHotels(req.body.StartLocation, req.body.StartDate).then(function(hotels){
        var duration = ((new Date(req.body.EndDate)) - (new Date(req.body.StartDate))) / (1000 * 60 * 60 * 24);
        res.render('hotels/hotelResults', {
                                        Hotels: airportDisplayProvider.resolveAirportsForAll(hotels),
                                        NumberOfDays: duration
                                    });  

    }).catch(function(error) {
        console.log(error);
      });
 });

 app.post('/hotels/purchase', function (req, res) {
   var cartId = req.cookies['CartId'];
   dataAccess.cart.upsertCartHotel(cartId, req.body.SelectedHotel, req.body.NumberOfDays).then(function(cart) {

        if ( cart.Id != cartId ) {
            res.cookie('CartId', cart.Id);
        }

        res.redirect('/cart');
    }).catch(function(error) {
        console.log(error);
      });
 });

 app.get('/cart', function (req, res) {
    var cartId = req.cookies['CartId'];
    cartDisplayProvider.loadFullCart(cartId).then(function(fullCart) {
        res.render('cart/index', { cart: fullCart });  
    }).catch(function(error) {
        console.log(error);
    });
  })
  
 app.post('/cart/purchase', function (req, res) {
    var cartId = req.cookies['CartId'];
    service.SendForProcessing(cartId, req.body.PurchasedOn).then(function() { 
        res.redirect('/itinerary');
    }).catch(function(error) {
        console.log(error);
    });
  });

  app.get('/itinerary', function (req, res) {
    var cartId = req.cookies['CartId'];
    dataAccess.itinerary.getItinerary(cartId).then(function(itinerary) {
        if ( itinerary != undefined ) {
            cartDisplayProvider.populateFullCart(itinerary).then(function(fullItinerary) {
                res.render('itinerary/index', { itinerary: fullItinerary });  
            });
        }
        else
        {
            res.render('itinerary/index', { itinerary: itinerary });  
        }
    });
  })

app.use('/public/css', express.static(path.join(__dirname, 'public/css')));
app.use('/public/js', express.static(path.join(__dirname, 'public/js')));
app.use('/public/lib', express.static(path.join(__dirname, 'public/lib')));

configPromise.then(function(contosoConfig) {
    
    if ( contosoConfig.dataType == 'CosmosSQL' ) {
        DataAccess = require('./dataAccess/cosmos');
    } else if ( contosoConfig.dataType == 'SQL' ) {
        DataAccess = require('./dataAccess/sql');
    }

    //if ( contosoConfig.servicesType == 'Monolith' ) {
        Service = require('./services/monolithService');
    //}

    dataAccess = new DataAccess(contosoConfig);
    service = new Service(contosoConfig, dataAccess);

    dbPromise = dataAccess.init();

    dbPromise.then(function() {
        airportDisplayProvider = new AirportDisplayProvider(dataAccess);
        cartDisplayProvider = new CartDisplayProvider(dataAccess, airportDisplayProvider);

        airportPromise = airportDisplayProvider.init();
        
        airportPromise.then(function () {
            http.createServer(app).listen(app.get('port'), function() {
                console.log('Express server listening on port ' + app.get('port'));
            });
        }).catch(function(error) {
            console.log(error);
        });
    }).catch(function(error) {
        console.log(error);
    });
});

