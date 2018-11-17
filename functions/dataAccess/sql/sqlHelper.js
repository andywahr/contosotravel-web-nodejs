'use strict';

const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const debug = require('debug');


class SqlHelper {

  constructor(contosoConfig) {
    this.contosoConfig = contosoConfig;
  }

  async init() {
      this.config = { 
        userName: this.contosoConfig.dataAccountUserName, 
        password: this.contosoConfig.dataAccountPassword, 
        server: this.contosoConfig.dataAccountName + ".database.windows.net", 
        options: { 
            database: this.contosoConfig.databaseName, 
            encrypt: true, 
            debug : {
              packet: false,
              data: false,
              payload: false,
              token: false,
              log: true
          }
        } 
    }; 
    this.debug = function(msg) { console.log(msg); };
    debug.enabled('tedious:*');
  }

  Execute(procName, paramFunction) {
    var localDebug = this.debug;
    return new Promise(
      (resolve, reject) => {
        var connection = new Connection(this.config);

        connection.on('debug', function(text) {
            localDebug(text);
          }
        );

        // Attempt to connect and execute queries if connection goes through
        connection.on('connect', function(err) {
            if (err) {
                localDebug(err)
                reject(err);
            }
            else {
              var request = new Request(procName, function (err, rowCount) { 
                if (err) {
                  localDebug(err)
                  connection.close();
                  reject(err);
                } else {
                  localDebug(rowCount.toString() + ' rows');
                  connection.close();
                  resolve(results);
                }                
              });
              
              request.on('debug', function(text) {
                  localDebug(text);
                }
              );

              var results = [];

              if ( paramFunction != undefined ){
                paramFunction(request);
              }

              request.on("row", function (columns) { 
                var item = {}; 
                columns.forEach(function (column) {  
                    item[column.metadata.colName] = column.value; 
                }); 
                results.push(item); 
              }); 

              connection.callProcedure(request);
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

module.exports = SqlHelper;
