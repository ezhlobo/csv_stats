var path = require('path');
var parser_csv = require(path.resolve('app', 'services', 'parser_csv'));
var parser_serializer = require(path.resolve('app', 'services', 'parser_serializer'));

process.on('message', function(file) {
    parser_csv(file, function(result) {
        process.send({
            type: 'parsed'
        });

        parser_serializer(result, function(result) {
            process.send({
                type: 'done',
                result: result
            });
        });
    });
});
