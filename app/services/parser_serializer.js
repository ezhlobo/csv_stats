var _ = require('lodash');
var fs = require('fs');
var classify = require('./classifier');

var Hashtable = require("jshashtable");

var serialize = function(data) {
    var out = {
        columns_count: 0,
        rows_count: 0,
        columns: []
    };

    // Remove first row with columns headers
    var first_row = data[0];
    data = _.drop(data);

    out.columns_count = first_row.length;
    out.rows_count = data.length;

    // Prepare data

    var columns_hashtable = [];

    _.times(out.columns_count, function(index) {
        columns_hashtable[index] = new Hashtable();
    });

    _.forEach(data, function(row, row_index) {
        _.forEach(row, function(column, column_index) {
            var current = columns_hashtable[column_index].get(column) || 0;

            columns_hashtable[column_index].put(column, 1);
        });
    });

    // Populate columns

    _.times(out.columns_count, function(index) {
        var table = columns_hashtable[index];
        var table_size = table.size();
        var table_keys = table.keys();
        var table_emptied = table.get('') || 0;
        var column = {
            filled: Math.round((1 - (table_emptied / table_size)) * 100),
            unique: table_size,
            type: classify(table_keys),
            name: first_row[index]
        };

        out.columns.push(column);
    });

    return out;
};

module.exports = function(data, callback) {
    var result = {};

    result.original = data;

    result.serialized = serialize(data);

    callback(result);
};
