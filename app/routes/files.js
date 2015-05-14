var fs = require('fs');
var express = require('express');
var router = express.Router();
var parse = require('./../services/parser');
var jade = require('jade');

// Start socket.io on :3535 port
var io = require('socket.io')((process.env.PORT || 3000) + 535);

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

    var socket_file = io.of('/' + file.name);

    socket_file.on('connection', function(socket) {
        parse(file, function(result) {
            storage[file.name].parsed = result;
            storage[file.name].parsed_at = new Date().getTime();

            var view = jade.compileFile('./app/views/shared/table.jade', {})({table: result.serialized});

            socket_file.emit('parsed', {table: view});
        });
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

    var view = jade.compileFile('./app/views/shared/table.jade', {})({table: file.parsed ? file.parsed.serialized : {}});

    res.render('files/show', {file: file, table: view})
})

module.exports = router;
