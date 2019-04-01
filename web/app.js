const appInsights = require("applicationinsights");
appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY);
appInsights.start();

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

if (process.argv.length > 2) {
    whichApp = process.argv[2];
}

var port = normalizePort(process.env.PORT || '1500');
app.set('port', port);

app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser())

app.set('view engine', 'ejs')

app.get('/', function (req, res) {
    res.render('shared/search', {
        search: {
            SearchMode: 'Flights',
            IncludeEndLocation: true,
            StartLocationLabel: "Depart From",
            EndLocationLabel: "Return From",
            StartDateLabel: "Depart",
            EndDateLabel: "Return",
            AirPorts: airportDisplayProvider.getAll()
        }, title: "Find Flights"
    });
});

app.get('/flights', function (req, res) {
    res.render('shared/search', {
        search: {
            SearchMode: 'Flights',
            IncludeEndLocation: true,
            StartLocationLabel: "Depart From",
            EndLocationLabel: "Return From",
            StartDateLabel: "Depart",
            EndDateLabel: "Return",
            AirPorts: airportDisplayProvider.getAll()
        }, title: "Find Flights"
    });
});

app.post('/flights/search', function (req, res) {
    var isTest = req.query.IsTest == "True";
    var startingFlight = dataAccess.flight.findFlights(req.body.StartLocation, req.body.EndLocation, req.body.StartDate, 3);
    var endingFlight = dataAccess.flight.findFlights(req.body.EndLocation, req.body.StartLocation, req.body.EndDate, 3);

    Promise.all([startingFlight, endingFlight]).then(function (values) {

        var departingFlights = airportDisplayProvider.resolveAirportsForAll(values[0]);
        var returningFlights = airportDisplayProvider.resolveAirportsForAll(values[1]);

        if (isTest) {
            departingFlights[getRandomInt(departingFlights.length)].Selected = true;
            returningFlights[getRandomInt(returningFlights.length)].Selected = true;
        }

        res.render('flights/flightResults', {
            DepartingFlights: departingFlights,
            ReturningFlights: returningFlights
        });

    }).catch(function (error) {
        console.log(error);
    });
});

app.post('/flights/purchase', function (req, res) {
    var cartId = req.cookies['CartId'];
    dataAccess.cart.upsertCartFlights(cartId, req.body.SelectedDepartingFlight, req.body.SelectedReturningFlight).then(function (cart) {

        if (cart.Id != cartId) {
            res.cookie('CartId', cart.Id);
        }

        res.redirect('/cart');

    }).catch(function (error) {
        console.log(error);
    });
});

app.get('/cars', function (req, res) {
    res.render('shared/search', {
        search: {
            SearchMode: 'Cars',
            IncludeEndLocation: false,
            StartLocationLabel: "Location",
            StartDateLabel: "Pick-Up",
            EndDateLabel: "Drop-Off",
            AirPorts: airportDisplayProvider.getAll()
        }, title: "Find Flights"
    });
});

app.post('/cars/search', function (req, res) {
    var isTest = req.query.IsTest == "True";

    dataAccess.car.findCars(req.body.StartLocation, req.body.StartDate).then(function (cars) {
        if (isTest) {
            cars[getRandomInt(cars.length)].Selected = true;
        }
        var duration = ((new Date(req.body.EndDate)) - (new Date(req.body.StartDate))) / (1000 * 60 * 60 * 24);
        res.render('cars/carResults', {
            Cars: airportDisplayProvider.resolveAirportsForAll(cars),
            NumberOfDays: duration
        });

    }).catch(function (error) {
        console.log(error);
    });
});

app.post('/cars/purchase', function (req, res) {
    var cartId = req.cookies['CartId'];
    dataAccess.cart.upsertCartCar(cartId, req.body.SelectedCar, req.body.NumberOfDays).then(function (cart) {

        if (cart.Id != cartId) {
            res.cookie('CartId', cart.Id);
        }

        res.redirect('/cart');

    }).catch(function (error) {
        console.log(error);
    });
});

app.get('/hotels', function (req, res) {
    res.render('shared/search', {
        search: {
            SearchMode: 'Hotels',
            IncludeEndLocation: false,
            StartLocationLabel: "Location",
            StartDateLabel: "Check-In",
            EndDateLabel: "Check-Out",
            AirPorts: airportDisplayProvider.getAll()
        }, title: "Find Flights"
    });
});

app.post('/hotels/search', function (req, res) {
    var isTest = req.query.IsTest == "True";

    dataAccess.hotel.findHotels(req.body.StartLocation, req.body.StartDate).then(function (hotels) {
        if (isTest) {
            hotels[getRandomInt(hotels.length)].Selected = true;
        }
        var duration = ((new Date(req.body.EndDate)) - (new Date(req.body.StartDate))) / (1000 * 60 * 60 * 24);
        res.render('hotels/hotelResults', {
            Hotels: airportDisplayProvider.resolveAirportsForAll(hotels),
            NumberOfDays: duration
        });

    }).catch(function (error) {
        console.log(error);
    });
});

app.post('/hotels/purchase', function (req, res) {
    var cartId = req.cookies['CartId'];
    dataAccess.cart.upsertCartHotel(cartId, req.body.SelectedHotel, req.body.NumberOfDays).then(function (cart) {

        if (cart.Id != cartId) {
            res.cookie('CartId', cart.Id);
        }

        res.redirect('/cart');
    }).catch(function (error) {
        console.log(error);
    });
});

app.get('/cart', function (req, res) {
    var cartId = req.cookies['CartId'];
    cartDisplayProvider.loadFullCart(cartId).then(function (fullCart) {
        res.render('cart/index', { cart: fullCart });
    }).catch(function (error) {
        console.log(error);
    });
})

app.post('/cart/purchase', function (req, res) {
    var cartId = req.cookies['CartId'];
    service.SendForProcessing(cartId, req.body.PurchasedOn).then(function () {
        res.redirect('/itinerary');
    }).catch(function (error) {
        console.log(error);
    });
});

app.get('/itinerary', function (req, res) {
    var cartId = req.cookies['CartId'];
    dataAccess.itinerary.getItinerary(cartId).then(function (itinerary) {
        if (itinerary != undefined) {
            cartDisplayProvider.populateFullCart(itinerary).then(function (fullItinerary) {
                res.render('itinerary/index', { itinerary: fullItinerary });
            });
        }
        else {
            res.render('itinerary/index', { itinerary: itinerary });
        }
    });
});

app.get('/test', function (req, res) {
    var airports = airportDisplayProvider.getAll();
    var minutesInADay = 60 * 24 * 1000;
    var minutesInAWeek = minutesInADay * 7;
    var minutesInAMonth = minutesInADay * 30;
    var startDate = new Date(new Date().getTime() + (Math.random() * minutesInAWeek));
    res.render('test/index', {
        test: {
            DepartFrom: airports[getRandomInt(airports.length)].AirportCode,
            ArriveAt: airports[getRandomInt(airports.length)].AirportCode,
            DepartOn: startDate,
            ReturnOn: new Date(startDate.getTime() + (Math.random() * minutesInAWeek)),
            PurchasedOn: new Date(new Date().getTime() + (-1 * Math.random() * minutesInAMonth))
        }
    });
});

app.use('/public/css', express.static(path.join(__dirname, 'public/css')));
app.use('/public/js', express.static(path.join(__dirname, 'public/js')));
app.use('/public/lib', express.static(path.join(__dirname, 'public/lib')));


configPromise.then(function (contosoConfig) {

    var promises = [];
    console.log('Done Loading Config');

    dataAccess = DataAccess.getDataProvider(contosoConfig);
    promises.push(dataAccess.init());

    service = Services.getServiceProvider(contosoConfig, dataAccess);
    promises.push(service.init());

    console.log('Done setting up data and service promise');

    Promise.all(promises).then(function () {

        console.log('Done waiting for data and service promise: proccessing ' + whichApp);

        console.log('Initing Web');
        airportDisplayProvider = new AirportDisplayProvider(dataAccess);
        cartDisplayProvider = new CartDisplayProvider(dataAccess, airportDisplayProvider);

        airportPromise = airportDisplayProvider.init();

        airportPromise.then(function () {
            http.createServer(app).listen(app.get('port'), function () {
                console.log('Express server listening on port ' + app.get('port'));
            });
        }).catch(function (error) {
            console.log(error);
        });

    }).catch(function (error) {
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

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}