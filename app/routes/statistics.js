var express = require('express');
var router = express.Router();
var stats = require('./../services/statistics');

// Get `/statistics`
router.get('/', function(req, res) {
    res.render('statistics/index', {stats: stats});
});

module.exports = router;
