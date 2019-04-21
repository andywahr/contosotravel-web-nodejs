
const appInsights = require("applicationinsights");
appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true)
  .setUseDiskRetryCaching(true)
  .start();

const FulfillmentService = require('./services/fulfillmentService');
var express = require('express');
var http = require('http');
var DataAccess = require('./dataAccess/dataAccessProvider');
var config = require('./config/keyVault');
var configPromise = config.loadConfig(process.env.KeyVaultAccountName);
const azureSB = require('azure-sb');

var app = express();
var dataAccess = '';
var sbService = '';
var whichApp = 'serviceHttp';

console.log("ARG Count: " + process.argv.length);

for (var ii = 0; ii < process.argv.length; ii++) {
  console.log("ARG [" + ii + "]: " + process.argv[ii]);
}

if (process.argv.length > 2) {
  whichApp = process.argv[2];
}

console.log("whichApp = " + whichApp);

var port = normalizePort(process.env.PORT || '1501');
app.set('port', port);

if (whichApp != 'servicebus') {
  var router = express.Router();
  app.use('/api', router);

  router.post('/PurchaseItinerary', function (req, res) {
    var purchaseItineraryMessage = req.body;

    console.log("Starting to finalize purchase of " + purchaseItineraryMessage.cartId);
    console.log("Calling Purchase method");

    purchaseItinerary(purchaseItineraryMessage).then(function (recordLocator) {
      console.log("Record Locator " + recordLocator + " complete for cart " + purchaseItineraryMessage.cartId);
      res.json({ recordLocator: recordLocator });
    }).catch(function (error) {
      console.log("Finalization purchase of " + purchaseItineraryMessage.cartId + " failed");
      res.send(error);
    });
  });
}

configPromise.then(function (contosoConfig) {

  var promises = [];
  console.log('Done Loading Config');

  dataAccess = DataAccess.getDataProvider(contosoConfig);
  promises.push(dataAccess.init());

  console.log('Done setting up data and service promise');

  Promise.all(promises).then(function () {

    console.log('Done waiting for data and service promise: proccessing ' + whichApp);

    if (whichApp != 'servicebus') {
      http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
      });
    }
    else if (whichApp == 'servicebus') {
      console.log('Connecting to ' + process.env.ConnectionStrings__ServiceBusConnection);
      sbService = azureSB.createServiceBusService(process.env.ConnectionStrings__ServiceBusConnection);
      sbInterval = setInterval(checkForMessages.bind(null, sbService, 'PurchaseItinerary'), 5000);
    }
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

async function purchaseItinerary(purchaseItineraryMessage) {
  var fulfillmentService = new FulfillmentService(dataAccess);

  console.log("Starting to finalize purchase of " + purchaseItineraryMessage.cartId);
  console.log("Calling Purchase method");

  var recordLocator = await fulfillmentService.Purchase(purchaseItineraryMessage.cartId, purchaseItineraryMessage.purchasedOn);

  if (recordLocator == undefined) {
    throw 'Purchased Itinerary failed';
  }

  return recordLocator;
}

function checkForMessages(sbService, queueName) {
  clearInterval(sbInterval);
  console.log('calling receiveQueueMessage');
  try {
    sbService.receiveQueueMessage(queueName, { isPeekLock: true, timeoutIntervalInS: 5 }, function (err, lockedMessage) {
      if (err) {
        if (err == 'No messages to receive') {
          console.log('No messages');
          clearInterval(sbInterval);
          sbInterval = setInterval(checkForMessages.bind(null, sbService, 'PurchaseItinerary'), 1000)
        } else {
          console.error('Failed to get message, reconnecting: ' + err.stack);
          clearInterval(sbInterval);
          sbInterval = setInterval(checkForMessages.bind(null, sbService, 'PurchaseItinerary'), 1000)
        }
      } else {
        requeue = false;
        processMessage(sbService, lockedMessage);
      }
    });
  }
  catch (e) {
    console.error('Failed to talk to Service Bus, reconnecting: ' + e.stack);
    clearInterval(sbInterval);
    sbInterval = setInterval(checkForMessages.bind(null, sbService, 'PurchaseItinerary'), 1000)
  }
}

function processMessage(sbService, lockedMsg) {

  console.log('Rx: ', lockedMsg);
  var purchaseItineraryMessage = JSON.parse(lockedMsg.body);

  console.log("Starting to finalize purchase of " + purchaseItineraryMessage.cartId);
  console.log("Calling Purchase method");

  purchaseItinerary(purchaseItineraryMessage).then(function (recordLocator) {
    console.log("Record Locator " + recordLocator + " complete for cart " + purchaseItineraryMessage.cartId);
    sbService.deleteMessage(lockedMsg, function (err2) {
      if (err2) {
        console.log('Failed to delete message: ', err2);
      } else {
        console.log('Deleted message.');
      }
      clearInterval(sbInterval);
      sbInterval = setInterval(checkForMessages.bind(null, sbService, 'PurchaseItinerary'), 100)
    })
  }).catch(function (error) {
    console.log("Finalization purchase of " + purchaseItineraryMessage.cartId + " failed:" + error);
    clearInterval(sbInterval);
    sbInterval = setInterval(checkForMessages.bind(null, sbService, 'PurchaseItinerary'), 1000)
  });
}