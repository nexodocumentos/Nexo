
var db = require('../Database/DConnection');
var app = require('../app');
module.exports = {
    getUser : function(email,callb){
        db.query('select * from user where email=? allow filtering;',[email], function(err,result){
            callb(err,result);
        });
    },
    registerUser : function(ci,password,name,email,phone,callb){
        db.query('insert into user (id,ci,password,name,email,phone)'
        +' values (UUID(),?,?,?,?,?); ',[ci,password,name,email,phone], function(err,result){
            callb(err,result);
        });
    }
}
