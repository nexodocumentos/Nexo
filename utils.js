
exports.myDateTime = function () {
    return Date();
};
exports.empty = function(x) {
    return (x == null || x==undefined || x == '');
}

exports.listToString = function(list) {
    ret ='';
    for(e in list){
        ret += list[e] + ','    
    }
    ret = ret.slice(0, -1);
    return ret;
}

exports.getToken = function (req){
    return req.headers['authorization'];
}

exports.getIdentNumber = function(x){
    return x.replace('-','').replace('.','').replace(' ','')
}