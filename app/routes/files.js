var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var express = require('express');
var router = express.Router();
var jade = require('jade');
var stats = require(path.resolve('app', 'services', 'statistics'));

var storage = {};

router.get('/', function(req, res) {
    res.render('files/index', {
        files: Object.keys(storage).length ? storage : null
    });
});

router.post('/', function(req, res) {
    // @TODO: Need to create service: create_file

    var file = req.files.file;

    storage[file.name] = file;
    storage[file.name].created_at = new Date().getTime();

    stats.data.loaded_data = stats.data.loaded_data + file.size;

    var socket_file = io.of('/' + file.name);

    var parser = child_process.fork(path.resolve('app', 'services', 'parser'));

    socket_file.on('connection', function(socket) {
        var cllb = {};

        cllb.parsed = function(result) {
            storage[file.name].parsed_at = new Date().getTime();

            socket_file.emit('parsed');
        };

        cllb.done = function(result) {
            storage[file.name].processed = result;
            storage[file.name].processed_at = new Date().getTime();

            stats.data.time_per_byte = ((storage[file.name].processed_at - storage[file.name].start_parsing_at) * 1024 / storage[file.name].size).toFixed(2);

            var view = jade.compileFile(path.resolve('app', 'views', 'shared', 'table.jade'))({
                table: result
            });

            socket_file.emit('done', {
                table: view
            });
        };

        parser.on('message', function(data) {
            cllb[data.type](data.result);

            if (data.type === 'done') {
                parser.kill('SIGKILL');
            }
        });

        if (!parser.killed) {
            storage[file.name].start_parsing_at = new Date().getTime();
            parser.send(file);
        }
    });

    var redirect_url = '/files/' + file.name;

    if (req.xhr) {
        res.send({
            url: redirect_url
        });
    } else {
        res.redirect(redirect_url);
    }
});

router.get('/:name', function(req, res) {
    var file = storage[req.params.name];

    var view = jade.compileFile(path.resolve('app', 'views', 'shared', 'table.jade'))({
        table: file.processed ? file.processed : null
    });

    res.render('files/show', {
        file: file,
        table: view
    });
})

module.exports = router;
