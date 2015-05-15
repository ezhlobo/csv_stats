var parser_csv = require('./../services/parser_csv');
var parser_serializer = require('./../services/parser_serializer');

process.on('message', function(file) {
    parser_csv(file, function(result) {
        process.send({type: 'parsed'});

        parser_serializer(result, function(result) {
            process.send({type: 'done', result: result});
        });
    });
});
