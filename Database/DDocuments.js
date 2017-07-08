
var db = require('../Database/DConnection');
var app = require('../app');
var ut = require('../utils');

module.exports = {
    getDocument : function(type,number,callb){
        db.query('select * from documents where type=? and number=?',[type,number], function(err,result){
            if (!err && result.rows.length > 0 && !result.rows[0].recovered){
                result = result.rows[0];
            } else {
                result = undefined;
            }
            callb(err,result);
         });
    },
    insertDocument : function(columns,values,callb){
        x = "?,".repeat(columns.length); 
        x = x.slice(0, -1);
        listColumns = ut.listToString(columns);
        db.query('insert into documents ('+listColumns+')' +
                ' values('+x+') ',values, function(err,result){
            callb(err,result);
        });
    }
}
