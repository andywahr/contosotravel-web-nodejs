'use strict';

const SqlHelper = require('./sqlHelper');
const TYPES = require('tedious').TYPES;

class SqlDbCar{
    constructor(sqlDbClient) {
        this.sqlDbClient = sqlDbClient;
    };
    
    async findCars(location, startDate) {
        var results = await this.sqlDbClient.Execute("FindCars", function(request) {
            request.addParameter('Location', TYPES.Char, location);
            request.addParameter('DesiredTime', TYPES.DateTimeOffset, new Date(startDate));
        });
        return this.fixCarTypes(results);
    }

    async findCar(carId) {
        var result = await this.sqlDbClient.Execute("FindCarById", function(request) {
            request.addParameter('Id', TYPES.Int, carId)
        });
        if ( result != undefined ) {
            return this.fixCarType(result[0]);
        }
        
        return result;
    }

    fixCarTypes(cars) {
        for ( var ii = 0; ii < cars.length; ii++ ) {
            cars[ii] = this.fixCarType(cars[ii]);
        }

        return cars;
    }

    fixCarType(car) {
        if ( car != undefined ) {
            switch (car.CarType) {
                case 0:
                    car.CarType = 'Compact';
                    break;

                case 1:
                    car.CarType = 'Intermediate';
                    break;
                        
                case 2:
                    car.CarType = 'Full';
                    break;
                        
                case 3:
                    car.CarType = 'SUV';
                    break;
                        
                case 4:
                    car.CarType = 'Minivan';
                    break;
                        
                case 5:
                    car.CarType = 'Convertable';
                    break;
                        
                default:
                    break;
            }
        }

        return car;
    }

};


module.exports = SqlDbCar;
