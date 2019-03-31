'use strict';

const TYPES = require('tedious').TYPES;

class SqlDbHotel{
    constructor(sqlDbClient) {
        this.sqlDbClient = sqlDbClient;
    };
    
    async findHotels(location, startDate) {
        var results = await this.sqlDbClient.Execute("FindHotels", function(request) {
            request.addParameter('LocationP', TYPES.Char, location);
            request.addParameter('DesiredTimeP', TYPES.DateTimeOffset, new Date(startDate));
        });
        return this.fixRoomTypes(results);
    }

    async findHotel(hotelId) {
        var result = await this.sqlDbClient.Execute("FindHotelById", function(request) {
            request.addParameter('IdP', TYPES.Int, hotelId)
        });
        if ( result != undefined ) {
            return this.fixRoomType(result[0]);
        }
        
        return result;        
    }

    fixRoomTypes(hotels) {
        for ( var ii = 0; ii < hotels.length; ii++ ) {
            hotels[ii] = this.fixRoomType(hotels[ii]);
        }

        return hotels;
    }

    fixRoomType(hotel) {
        if ( hotel != undefined ) {
            switch (hotel.RoomType) {
                case 0:
                hotel.RoomType = 'King';
                    break;

                case 1:
                    hotel.RoomType = 'TwoQueens';
                    break;
                        
                case 2:
                    hotel.RoomType = 'Suite';
                    break;
                        
                case 3:
                    hotel.RoomType = 'Penthouse';
                    break;

                default:
                    break;
            }
        }

        return hotel;
    }

};

module.exports = SqlDbHotel;
