
module.exports.getServiceProvider = function(contosoConfig, dataAccess) {

    if ( contosoConfig.servicesType == 'Monolith' ) {
        Service = require('../services/monolithService');
    } else if (contosoConfig.servicesType == 'ServiceBus' ) {
        Service = require('../services/serviceBusService');
    } else if (contosoConfig.servicesType == 'EventGrid' ) {
        Service = require('../services/eventGridService');
    } 

    service = new Service(contosoConfig, dataAccess);

    return service;
}