var path = require('path');
var express = require('express');
var router = express.Router();
var stats = require(path.resolve('app', 'services', 'statistics'));

router.get('/', function(req, res) {
    res.render('statistics/index', {
        stats: stats
    });
});

module.exports = router;
