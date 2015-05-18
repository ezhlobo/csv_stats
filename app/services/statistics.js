var _ = require('lodash');
var ps = require('ps-node');
var exec = require('sync-exec');

function parsePS(pid, output) {
    var lines = output.trim().split('\n');

    if (lines.length !== 2) {
        throw new Error('INVALID_PID');
    }

    var matcher = /[ ]*([0-9]*)[ ]*([0-9]*)[ ]*([0-9\.]*)/;
    var result = lines[1].match(matcher);

    if(result) {
        return {
            memory: parseInt(result[1]) * 1024,
            memoryInfo: {
                rss: parseFloat(result[1]) * 1024,
                vsize: parseFloat(result[2]) * 1024
            },
            cpu: parseFloat(result[3])
        };
    } else {
        throw new Error('PS_PARSE_ERROR');
    }
}

var stats = {};

stats.opts = {
    interval: 1000,
    count: 100
};

stats.data = {
    __memory: _.range(0, stats.opts.count, 0),
    __loaded: _.range(0, stats.opts.count, 0),
    __tpm: _.range(0, stats.opts.count, 0),
    loaded_data: 0,
    time_per_byte: 0
};

var socket_memory = io.of('/memory_usage');
var socket_time = io.of('/time');

stats.start = function() {

    stats._timer = setInterval(function() {
        var memoryUsage = process.memoryUsage().rss;

        ps.lookup({
            psargs: '-l',
            ppid: process.pid
        }, function(err, list) {
            if (err) {
                throw new Error( err );
            }

            list.forEach(function(process) {
                if (process) {
                    var process_memory_rss = parsePS(process.pid, exec('ps -o "rss,vsize,pcpu" -p ' + process.pid).stdout).memoryInfo.rss;

                    memoryUsage = memoryUsage + process_memory_rss;
                }
            });

            stats.data.__memory = _.drop(stats.data.__memory);
            stats.data.__memory.push(memoryUsage);

            stats.data.__loaded = _.drop(stats.data.__loaded);
            stats.data.__loaded.push(stats.data.loaded_data);

            stats.data.__tpm = _.drop(stats.data.__tpm);
            stats.data.__tpm.push(stats.data.time_per_byte);

            socket_memory.emit('update', {stats: stats.data});
            socket_time.emit('update', {stats: stats.data});
        });


    }, stats.opts.interval);
};

module.exports = stats;
