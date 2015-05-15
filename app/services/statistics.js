var _ = require('lodash');

var stats = {};

stats.opts = {
    interval: 1500,
    count: 100
};

stats.data = {
    __memory: _.range(0, stats.opts.count-1, 0),
    __loaded: _.range(0, stats.opts.count-1, 0),
    __tpm: _.range(0, stats.opts.count-1, 0),
    loaded_data: 0,
    time_per_byte: 0
};

var socket_memory = io.of('/memory_usage');
var socket_time = io.of('/time');

stats.start = function() {
    stats._timer = setInterval(function() {

        stats.data.__memory = _.drop(stats.data.__memory);
        stats.data.__memory.push(process.memoryUsage().rss);

        stats.data.__loaded = _.drop(stats.data.__loaded);
        stats.data.__loaded.push(stats.data.loaded_data);

        stats.data.__tpm = _.drop(stats.data.__tpm);
        stats.data.__tpm.push(stats.data.time_per_byte);

        socket_memory.emit('update', {stats: stats});
        socket_time.emit('update', {stats: stats});

    }, stats.opts.interval);
};

module.exports = stats;
