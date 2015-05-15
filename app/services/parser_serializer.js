var _ = require('lodash');
var fs = require('fs');
var classify = require('./classifier');

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

    var columns_hashtable = [];
    var columns_emptied = _.range(0, out.columns_count, 0);

    var output = function(column_index) {
        var table_size = data.length;
        var table_keys = Object.keys(columns_hashtable[column_index]);
        var table_emptied = columns_emptied[column_index];

        out.columns.push({
            filled: Math.round((1 - (table_emptied / table_size)) * 100),
            unique: table_keys.length,
            type: classify(table_keys),
            name: first_row[column_index]
        });
    };

    _.forEach(data, function(row, row_index) {
        _.forEach(row, function(column, column_index) {
            if (row_index == 0) {
                columns_hashtable.push({});
            }

            if (!column) {
                columns_emptied[column_index]++;
            }

            columns_hashtable[column_index][column] = 1;

            if (row_index == data.length - 1) {
                output(column_index);
            }
        });
    });

    return out;
};

module.exports = function(data, callback) {
    var result = {};

    result.original = data;

    result.serialized = serialize(data);

    callback(result);
};
