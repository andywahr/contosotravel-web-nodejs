
var express = require('express');
var cookieParser = require('cookie-parser')
var ejs = require('ejs');
var http = require('http');
var path = require('path');

var CartDisplayProvider = require('./dataAccess/cartDisplayProvider');
var AirportDisplayProvider = require('./dataAccess/airportDisplayProvider');
var DataAccess = require('./dataAccess/dataAccessProvider');
var Services = require('./services/servicesProvider');
var config = require('./config/keyVault');
var configPromise = config.loadConfig(process.env.KeyVaultAccountName);

var app = express();
var dataAccess = '';
var service = '';
var cartDisplayProvider = '';
var airportDisplayProvider = '';
var sbService = '';
var whichApp = 'web';

if ( process.argv.length > 2 )
{
    whichApp = process.argv[2];
}

var port = normalizePort(process.env.PORT || '1500');
app.set('port', port);

if ( whichApp == 'serviceHttp' )
{
    var router = express.Router();
    app.use('/api', router);

    router.post('/', function (req, res) {
        var purchaseItineraryMessage = req.body;
    
        console.log("Starting to finalize purchase of " + purchaseItineraryMessage.cartId);
        console.log("Calling Purchase method");

        purchaseItinerary(purchaseItineraryMessage).then(function (recordLocator) {
            console.log("Record Locator " + recordLocator+ " complete for cart " + purchaseItineraryMessage.cartId);
            res.json({recordLocator: recordLocator});
        }).catch(function(error) {
            console.log("Finalization purchase of " + purchaseItineraryMessage.cartId + " failed");
            res.send(error);
        });
    });
}
else if ( whichApp == 'web' )
{
    app.use(express.json()); 
    app.use(express.urlencoded());
    app.use(cookieParser())

    app.set('view engine', 'ejs')

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
}

configPromise.then(function(contosoConfig) {

    var promises = [];

    dataAccess = DataAccess.getDataProvider(contosoConfig);
    promises.push(dataAccess.init());

    if ( whichApp == 'web' )
    {
        servicePromise = service.init();
        promises.push(Services.getServiceProvider(contosoConfig, dataAccess));
    }
    
    Promise.all(promises).then(function() {

        if ( whichApp == 'web ')
        {
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
        }
        else if ( whichApp == 'serviceHttp' )
        {
            http.createServer(app).listen(app.get('port'), function() {
                console.log('Express server listening on port ' + app.get('port'));
            });            
        }
        else if (whichApp == 'serviceServiceBus')
        {
            console.log('Connecting to ' + contosoConfig.serviceConnectionString + ' queue ' + PurchaseItinerary);
            sbService = azure.createServiceBusService(contosoConfig.serviceConnectionString);
            sbService.getQueue('PurchaseItinerary', function (err) {
              if (err) {
               console.log('Failed to create queue: ', err);
              } else {
               setInterval(checkForMessages.bind(null, sbService, queueName, processMessage.bind(null, sbService)), 5000);
              }
            });
        }
    }).catch(function(error) {
        console.log(error);
    });
});

function normalizePort(val) {
    var port = parseInt(val, 10);
  
    if (isNaN(port)) {
      // named pipe
      return val;
    }
  
    if (port >= 0) {
      // port number
      return port;
    }
  
    return false;
  }

  async function purchaseItinerary(purchaseItineraryMessage)
  {
    var fulfillmentService = new FulfillmentService(dataAccess);

    console.log("Starting to finalize purchase of " + purchaseItineraryMessage.cartId);
    console.log("Calling Purchase method");

    var recordLocator = await fulfillmentService.Purchase(purchaseItineraryMessage.cartId, purchaseItineraryMessage.purchasedOn);

    if (recordLocator == undefined)
    {
        throw 'Purchased Itinerary failed';
    }

    return recordLocator;
  }

  function checkForMessages(sbService, queueName, callback) {
    sbService.receiveQueueMessage(queueName, { isPeekLock: true }, function (err, lockedMessage) {
      if (err) {
        if (err == 'No messages to receive') {
          console.log('No messages');
        } else {
          callback(err);
        }
      } else {
        callback(null, lockedMessage);
      }
    });
  }
   
  function processMessage(sbService, err, lockedMsg) {
    if (err) {
      console.log('Error on Rx: ', err);
    } else {
      console.log('Rx: ', lockedMsg);
      var purchaseItineraryMessage = lockedMsg.body;
    
      console.log("Starting to finalize purchase of " + purchaseItineraryMessage.cartId);
      console.log("Calling Purchase method");

      purchaseItinerary(purchaseItineraryMessage).then(function (recordLocator) {
          console.log("Record Locator " + recordLocator + " complete for cart " + purchaseItineraryMessage.cartId);
          sbService.deleteMessage(lockedMsg, function(err2) {
            if (err2) {
              console.log('Failed to delete message: ', err2);
            } else {
              console.log('Deleted message.');
            }
          })
      }).catch(function(error) {
          console.log("Finalization purchase of " + purchaseItineraryMessage.cartId + " failed");
          res.send(error);
      });
    }
  }