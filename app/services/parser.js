var _ = require('lodash');
var fs = require('fs');
var parse = require('csv-parse');
var classify = require('./classifier');
var Baobab = require('baobab');

var serialize = function(data) {
    var out = {
        columns_count: 0,
        rows_count: 0,
        columns: []
    };

    var first_row = data[0];
    data = _.drop(data);

    out.columns_count = first_row.length;
    out.rows_count = data.length;

    // Reverse
    var columns = [];

    for (var i = 0; i < out.columns_count; i++) {
        columns[i] = [];
    }

    for (var j = 0; j < out.rows_count; j++) {
        var row = data[j];

        for (var i = 0; i < out.columns_count; i++) {
            columns[i].push(row[i]);
        }
    }
    // /Reverse

    for (var i = 0; i < out.columns_count; i++) {
        var column = columns[i];
        var uniq = _.uniq(column);
        var filled = _.without(column, '');

        var item = {
            filled: Math.round((filled.length / column.length) * 100),
            unique: uniq.length,
            type: classify(uniq),
            name: first_row[i],
        };

        out.columns.push(item);
    }

    return out;
};

var delimiter = function(text) {
    var first_line = text.match(/^([^\n]*)\n.*/, '$1')[1];

    return first_line.replace(/"[^"]*"/g, '1').match(/^[\w\s".]+(.).+/)[1];
};

module.exports = function(file, next) {
    var result = {};
    var file_path = __dirname.replace(/app\/services$/, '') + file.path;
    var content = fs.readFileSync(file_path, 'utf8');

    console.log(delimiter(content));

    var parsing = parse(content, {delimiter: delimiter(content)}, function(err, data) {
        if (err) {
            console.log(err);

        } else {
            result.original = data;
            result.serialized = serialize(data);

            next(result);
        }
    });
};
