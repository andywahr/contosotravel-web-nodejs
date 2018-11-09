
class AirportDisplayProvider {

    constructor(dataAccess) {
      this.dataAccess = dataAccess;
    }

    async init() {
        this.airportList = await this.dataAccess.airport.getAll();
        var airports = {};

        this.airportList.forEach(function (airport) {
            if ( airport.Id == undefined ) {
                airport.Id = airport.AirportCode;
            }

            airports[airport.AirportCode.toString()] = airport;
        });

        this.airports = airports;
    }

    getAll() {
        return this.airportList;
    }

    resolveAirportsForAll(pocos) {
        if ( pocos != undefined ) {
            for ( var ii = 0; ii < pocos.length; ii++ ){ 
                pocos[ii] = this.resolveAirports(pocos[ii]);
            }      
        }
        return pocos;
    }

    resolveAirports(poco) {
        if ( poco != undefined ) {
            if ( poco.Location != undefined && poco.LocationAirport == undefined ) { 
                poco.LocationAirport = this.airports[poco.Location];
            } 
            
            if ( poco.DepartingFrom != undefined && poco.DepartingFromAirport == undefined ) { 
                poco.DepartingFromAirport = this.airports[poco.DepartingFrom];
            } 
            
            if ( poco.ArrivingAt != undefined  && poco.ArrivingAtAirport == undefined ) { 
                poco.ArrivingAtAirport = this.airports[poco.ArrivingAt];
            }             
        }
        return poco;
    }
}

module.exports = AirportDisplayProvider;