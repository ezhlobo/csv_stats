var fs = require('fs');
var path = require('path');
var csv_parse = require('csv-parse');

var delimiter = function(text) {
    var first_line = text.match(/^([^\n]*)\n.*/, '$1')[1];

    return first_line.replace(/"[^"]*"/g, '1').match(/^[\w\s".]+(.).+/)[1];
};

module.exports = function(file, callback) {
    var file_path = path.join(__dirname, '../../', file.path);
    var content = fs.readFileSync(file_path, 'utf8');

    var parsing = csv_parse(content, {delimiter: delimiter(content)}, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            callback(data);
        }
    });
};
