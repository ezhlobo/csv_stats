var _ = require('lodash');

var stats = {};

stats.opts = {
    interval: 1000,
    count: 50
};

stats.data = {
    __memory: _.range(stats.opts.count),
    __loaded: _.range(stats.opts.count),
    loaded_data: 0
};

var socket = io.of('/memory_usage');

stats.start = function() {
    stats._timer = setInterval(function() {

        stats.data.__memory = _.drop(stats.data.__memory);
        stats.data.__memory.push(process.memoryUsage().rss);

        stats.data.__loaded = _.drop(stats.data.__loaded);
        stats.data.__loaded.push(stats.data.loaded_data);

        socket.emit('update', {stats: stats});

    }, stats.opts.interval);
};

module.exports = stats;
