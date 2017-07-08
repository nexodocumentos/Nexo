var dDocuments = require('../Database/DDocuments');
var lSession = require('../Logic/LSession');
var ut = require('../utils');


module.exports = {
    findDocument: function (type, number, callb) {
        dDocuments.getDocument(type, number, function (err, result) {
            ret = {
                'exists': false,
                'found': false,
                data: undefined
            };
            if (!ut.empty(result)) {
                ret.exists = true;
                ret.found = result.found;
            }
            callb(err, ret);
        });
    },
    publishFoundDocument: function (data, callb) {//Encontre un documento
        data.description = data.description ? data.description : '';
        dDocuments.getDocument(data.type, data.number, function (err, doc) {
            if (doc) {//Ya se habia denunciado como encontrado
                if (doc.found) {
                    callb(err, { 'exists': true, 'found': true});                       
                } else {//Ya se habia denunciado como perdido
                    dDocuments.insertDocument(
                        ['type', 'number', 'publication_date', 'recovered', 'recovery_date', 'finder', 'description'],
                        [data.type, data.number, doc.publication_date, 'true', Date.now(),{'name':data.name,'email':data.email,'phone':data.phone}, data.message],
                        function (err, result) {
                            callb(err, { 'exists': true, 'found': false, data:doc })
                        });
                }
            } else {
                dDocuments.insertDocument(
                    ['type', 'number', 'found','finder', 'description', 'publication_date', 'recovered'],
                    [data.type, data.number,true,{'name':data.name,'email':data.email,'phone':data.phone}, data.message, Date.now(), false],
                    function (err, result) {
                        callb(err, { 'exists': false })
                    });
            }
        })
    },
    publishLossedDocument: function (req, data, callb) {
        lSession.getUserFromSession(req, function (err, user) {
            if (err) { callb(err, undefined) }
            data.description = data.description ? data.description : '';
            dDocuments.getDocument(data.type, data.number, function (err, doc) {
                if (doc) {//Ya se habia denunciado
                    if (doc.found) { // como encontrado
                        dDocuments.insertDocument(
                            ['type', 'number', 'publication_date', 'recovered', 'recovery_date', 'loster', 'loster_id'],
                            [data.type, data.number, doc.publication_date, 'true', Date.now(), { 'name': user.name, 'email': user.email, 'phone': user.phone.toString() }, user.id.toString()],
                            function (err, result) {
                                callb(err, { 'exists': true, 'publicatedByMe': false, 'found': true, 'doc': doc })
                            });
                    } else { //  como perdido
                        byMe = (doc.loster_id == user.id.toString());
                        callb(err, { 'exists': true, 'publicatedByMe': byMe, 'found': false})
                    }

                } else {
                    dDocuments.insertDocument(
                        ['type', 'number', 'publication_date', 'found', 'loster', 'loster_id', 'recovered'],
                        [data.type, data.number, Date.now(), false, { 'name': user.name, 'email': user.email, 'phone': user.phone.toString() }, user.id.toString(), false],
                        function (err, result) {
                            callb(err, { 'exists': false })
                        });
                }
            })
        });

    }
}


