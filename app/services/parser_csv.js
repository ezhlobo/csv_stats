var fs = require('fs');
var path = require('path');
var csv_parse = require('csv-parse');

var delimiter = function(text) {
    var first_line = text.match(/^([^\n]*)\n.*/, '$1')[1];

    return first_line.replace(/"[^"]*"/g, '1').match(/^[\w\s".]+(.).+/)[1];
};

module.exports = function(file, callback) {
    var file_path = path.resolve(file.path);
    var content = fs.readFileSync(file_path, 'utf8');
    var options = {
        delimiter: delimiter(content)
    };

    var parsing = csv_parse(content, options, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            callback(data);
        }
    });
};
