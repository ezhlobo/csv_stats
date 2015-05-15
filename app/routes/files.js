var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var express = require('express');
var router = express.Router();
var stats = require('./../services/statistics');
var jade = require('jade');

var storage = {};

// GET `/files`
router.get('/', function(req, res) {
    res.render('files/index', {files: Object.keys(storage).length ? storage : false})
});

// POST `/files`
router.post('/', function(req, res) {
    var file = req.files.file;

    storage[file.name] = file;
    storage[file.name].created_at = new Date().getTime()

    stats.data.loaded_data = stats.data.loaded_data + file.size;

    var socket_file = io.of('/' + file.name);

    var parser = child_process.fork(path.join(__dirname, '../services/parser'));

    socket_file.on('connection', function(socket) {
        var cllb = {};

        cllb.parsed = function(result) {
            storage[file.name].parsed_at = new Date().getTime();

            socket_file.emit('parsed');
        };

        cllb.done = function(result) {
            storage[file.name].processed = result;
            storage[file.name].processed_at = new Date().getTime();

            stats.data.time_per_byte = ((storage[file.name].processed_at - storage[file.name].created_at) * 1024 / storage[file.name].size).toFixed(2);

            var view = jade.compileFile('./app/views/shared/table.jade', {})({table: result.serialized});

            socket_file.emit('done', {table: view});
        };

        parser.on('message', function(data) {
            cllb[data.type](data.result);

            if (data.type === 'done') {
                console.log(parser);
                parser.kill('SIGKILL');
                console.log(parser);
            }
        });

        if (!parser.killed) {
            parser.send(file);
        }
    });

    var redirect_url = '/files/' + file.name;

    if (req.xhr) {
        res.send({url: redirect_url});
    } else {
        res.redirect(redirect_url);
    }
});

router.get('/:name', function(req, res) {
    var file = storage[req.params.name];

    var view = jade.compileFile('./app/views/shared/table.jade', {})({table: file.processed ? file.processed.serialized : {}});

    res.render('files/show', {file: file, table: view})
})

module.exports = router;
