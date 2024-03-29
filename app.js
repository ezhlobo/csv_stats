// Start socket.io on :3535 port
io = require('socket.io')((process.env.PORT || 3000) + 535);

var express = require('express');
var path = require('path');
var logger = require('morgan');
var multer  = require('multer');
var stats = require(path.resolve('app', 'services', 'statistics'));

var app = express();

app.use(logger('dev'));

// View engine setup
app.set('views', path.resolve('app', 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.resolve('public')));

app.use(function(req, res, next) {
    res.locals.current_path = req.path;
    next();
});

app.use(function(req, res, next) {
   res.locals.is_xhr = req.xhr;
   next();
});

app.use(multer({
    dest: path.resolve('public', 'uploads')
}));

app.use('/', require(path.resolve('app', 'routes', 'index')));
app.use('/files', require(path.resolve('app', 'routes', 'files')));
app.use('/statistics', require(path.resolve('app', 'routes', 'statistics')));

// Catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

stats.start();

module.exports = app;
