require('dotenv').config()
var cassandra = require('cassandra-driver');
var async = require('async');


var client = new cassandra.Client({contactPoints: [process.env.SERVER_PORT], keyspace: 'Nexo'});
module.exports = {
    query : function (query,pars,callback){
        client.execute(query,pars,{ prepare : true },  function(err, result) {
            if (err){
                console.log('Cassandra error ' + err);
            }
            callback(err,result);
        });
    }
}

//const query = 'SELECT name, email FROM users WHERE key = ?';
//client.execute(query, [ 'someone' ])
//  .then(result => console.log('User with email %s', result.rows[0].email));

