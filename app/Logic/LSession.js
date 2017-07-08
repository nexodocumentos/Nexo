var dSession = require('../Database/DSession');
var ut = require('../utils');
var jwt = require('jsonwebtoken');

module.exports = {
    getUser: function (email, callb) {
        dSession.getUser(email, function (err, result) {
            ret=undefined;
            if (!err) {
                if (!ut.empty(result.rows) && result.rows.length > 0) {
                    ret = result.rows[0];
                } else {
                    ret = undefined;
                }
            }
            callb(err, ret);
        });
    },
    logIn: function (email, pass, callb) {
        this.getUser(email, function (err, result) {
            if (!err && result) {
                if (result.password == pass) {
                    ret = result;
                } 
            }
            callb(err, ret);
        });
    },
    registerUser: function (data, callb) {
        dSession.registerUser(data.ci, data.password, data.name, data.email, data.phone, function (err, result) {
            callb(err, result);
        });
    },
    getUserFromSession: function (req,callback) {
        token = ut.getToken(req);
        decoded = jwt.decode(token);
        var decoded = jwt.decode(token, { complete: true });
        email = decoded.payload.data;
        this.getUser(email, function(err,response){
            callback(err,response);
        });
    }

}
