
module.exports.getDataProvider = function(contosoConfig) {
    
    if ( contosoConfig.dataType == 'CosmosSQL' ) {
        DataAccess = require('../dataAccess/cosmos');
    } else if ( contosoConfig.dataType == 'SQL' ) {
        DataAccess = require('../dataAccess/sql');
    }

    dataAccess = new DataAccess(contosoConfig);

    return dataAccess;
}