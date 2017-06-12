//this is only an example, handling everything is yours responsibilty !

var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;


exports.Select = function (connection, query, callback) {
    var req = new Request(query, function (err, rowCount) {
        if (err) {
            console.log(err);
            return;
        }
    });
    var ans = [];
    var properties = [];
    req.on('columnMetadata', function (columns) {
        columns.forEach(function (column) {
            if (column.colName != null)
                properties.push(column.colName);
        });
    });
    req.on('row', function (row) {
        var item = {};
        for (i = 0; i < row.length; i++) {
            item[properties[i]] = row[i].value;
        }
        ans.push(item);
    });

    req.on('requestCompleted', function () {
        //don't forget handle your errors
        console.log('request Completed: ' + req.rowCount + ' row(s) returned');
        console.log(ans);
        callback(ans);
    });

    connection.execSql(req);

};

// execute select queries from DB with promise
exports.promiseSelect = function(connection, query) {
    return new Promise(function(resolve,reject){
        var req = new Request(query, function (err, rowCount) {
            if (err) {
                console.log(err);
                reject(err.message);
            }
        });
        var ans = [];
        var properties = [];
        req.on('columnMetadata', function (columns) {
            columns.forEach(function (column) {
                if (column.colName != null)
                    properties.push(column.colName);
            });
        });
        req.on('row', function (row) {
            var item = {};
            for (i=0; i<row.length; i++) {
                item[properties[i]] = row[i].value;
            }
            ans.push(item);
        });

        req.on('requestCompleted', function () {
            //don't forget handle your errors
            console.log('request Completed: '+ req.rowCount + ' row(s) returned');
            resolve(ans);
        });
        connection.execSql(req);
    });

};


exports.promiseInsert = function (connection, query) {
return new Promise(function (resolve, reject) {
    var req = new Request(query, function (err) {
        if (err) {
            console.log(err);
            reject(err.message);
        }
        else{ // succeed
            console.log('Insertion succeed!');
            resolve();
        }
    });
    connection.execSql(req) // perform the query

});
};

exports.promiseUpdate = function (connection,query) {
    return new Promise(function (resolve, reject) {
        var req = new Request(query,function (err, rowCount,rows) {
            if(err) {
                console.log(err);
                reject(err);
            }
            else{
                resolve();
            }

        });
        connection.execSql(req);
    });
};


exports.Insert = function (connection,query, callback) {
        var req = new Request(query, function (err) {
            if (err) {
                callback(err.message);
            }
            else{ // succeed
                callback('Insertion succeed!');
            }
        });
        connection.execSql(req) // perform the query
};


exports.Select = function (connection, query, callback) {
    var req = new Request(query, function (err, rowCount) {
        if (err) {
            console.log(err);
            return;
        }
    });
    var ans = [];
    var properties = [];
    req.on('columnMetadata', function (columns) {
        columns.forEach(function (column) {
            if (column.colName != null)
                properties.push(column.colName);
        });
    });
    req.on('row', function (row) {
        var item = {};
        for (i = 0; i < row.length; i++) {
            item[properties[i]] = row[i].value;
        }
        ans.push(item);
    });

    req.on('requestCompleted', function () {
        //don't forget handle your errors
        console.log('request Completed: ' + req.rowCount + ' row(s) returned');
        //console.log(ans);
        callback(ans);
    });

    connection.execSql(req);

};

exports.Update = function (connection,query, callback) {
    var req = new Request(query, function (err) {
        if (err) {
            callback(err.message);
        }
        else{ // succeed
            callback('update succeed!');
        }
    });
    connection.execSql(req) // perform the query
};