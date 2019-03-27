'use strict';
const mysql = require('mysql');
const debug = require('debug');

class MySqlRequest {
  constructor() {
    this.parameters = [];
  }

  addParameter(field, type, value) {
    this.parameters.push(value);
  }

  getQueryParams() {
    var params = [];
    for ( var ii = 0; ii < this.parameters.length; ii++ ) {
      params.push('?');
    }
    return '(' + params.join(',') + ')';
  }
}


class MySqlHelper {

  constructor(contosoConfig) {
    this.contosoConfig = contosoConfig;
  }

  async init() {

    this.config =
    {
      host: this.contosoConfig.dataAccountName + '.mysql.database.azure.com',
      user: this.contosoConfig.dataAccountUserName+ '@' + this.contosoConfig.dataAccountName + '.mysql.database.azure.com',
      password: this.contosoConfig.dataAccountPassword,
      database: 'ContosoTravel',
      port: 3306,
      ssl: true
    };

    this.debug = function(msg) { console.log(msg); };
    debug.enabled('mysql:*');
  }

  Execute(procName, paramFunction) {
    var localDebug = this.debug;

    return new Promise(
      (resolve, reject) => {            
        const conn = new mysql.createConnection(this.config);

        conn.connect(
          function (err) { 
            if (err) { 
              localDebug(err)
              reject(err);
            }
            else {
              var results = [];
              var request = new MySqlRequest();
              if ( paramFunction != undefined ){
                 paramFunction(request);
              }

              var query = {
                   sql: 'CALL ' + procName + request.getQueryParams(),
                   values: request.parameters
               };

              conn.query(query, function (err, rows, fields) {
                if (err) {
                  localDebug(err)
                  reject(err);
                }
                else {
                  if ( rows != null && rows.length > 0 ) {                  
                    rows[0].forEach(function (row) {  
                      var item = {};

                      fields[0].forEach(function(field){
                        item[field.name] = row[field.name]; 
                      });
                        
                      results.push(item);
                    });                   
                  }
                }
              });

              conn.end(
               function (err) { 
                if (err) {
                  localDebug(err)
                  reject(err);
                } else {
                  resolve(results);
                }  
            });
          }
        });              
      });
  }

  nullIfZero(val) {
    if ( val == 0 || val == '0') {
      return null;
    }
    return val;
  }

  ensureCartGuid(cartId) {
      if ( cartId != undefined && cartId.length == 32 ) {
          return cartId.substring(0, 8) + '-' + cartId.substring(8, 12) + '-' + cartId.substring(12, 16) + '-' + cartId.substring(16, 20) + '-' + cartId.substring(20, 32);
      }
      return cartId;
  }

}

module.exports = MySqlHelper;
