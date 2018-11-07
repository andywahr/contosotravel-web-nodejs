
class CartDisplayProvider {

    constructor(dataAccess) {
      this.dataAccess = dataAccess;
    }
  
    async loadFullCart(cartId) {
        var cart = await this.dataAccess.cart.getCart(cartId);
        var fullCart = await this.populateFullCart(cart);

        return fullCart;
    }

    async populateFullCart(cart) {
        if ( cart != undefined ) {
            if ( cart.DepartingFlight != undefined ) { 
                cart.DepartingFlight = await this.dataAccess.flight.findFlight(cart.DepartingFlight);
            } 
            
            if ( cart.ReturningFlight != undefined ) { 
                cart.ReturningFlight = await this.dataAccess.flight.findFlight(cart.ReturningFlight);
            } 
            
            if ( cart.HotelReservation != undefined ) { 
                cart.HotelReservation = await this.dataAccess.hotel.findHotel(cart.HotelReservation);
            } 
            
            if ( cart.CarReservation != undefined ) { 
                cart.CarReservation = await this.dataAccess.car.findCar(cart.CarReservation);
            }
        }

        return cart;
    }
}

module.exports = CartDisplayProvider;