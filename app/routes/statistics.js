var express = require('express');
var router = express.Router();
var pretty = require('prettysize');
var stats = require('./../services/statistics');

var serialize = function(obj) {
    for (var id in obj) {
        obj[id] = pretty(obj[id]);
    }

    return obj;
};

// Get `/statistics`
router.get('/', function(req, res) {
    // setInterval(function() {
        // console.log(serialize(process.memoryUsage()))
        // console.log(process.uptime());
    //     usage.lookup(process.pid, function(err, result) {
    //         console.log(result);
    //     });
    // }, 1000);

    res.render('statistics/index', {stats: stats});
});

module.exports = router;
