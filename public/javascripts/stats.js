(function() {
  var Stats = (function() {

    function stats(id, options) {
      this.id = id;
      this.options = options;

      this.chart = createChart(id, options);
      this.updateData();

      return this;
    }

    stats.prototype = {};

    stats.prototype.updateData = function(data) {
      this.chart.dataProvider = data;

      this.chart.validateData();

      return this.chart;
    };

    stats.prototype.connectToStream = function(callback) {
      socket = io.connect('http://localhost:3535/' + this.id);

      socket.on('update', callback);

      return socket;
    };

    // Private

    var createChart = function(id, options) {
      return AmCharts.makeChart(id, options);
    };

    return stats;

  })();

  /*
  e.g. params = [['memory', memory], ['loaded', loaded]]
  */
  var getData = function(itemsCount, params) {
    var data = [];

    _.times(itemsCount, function(index) {
      var item = {
        step: index
      };

      _.forEach(params, function(param) {
        item[param[0]] = param[1][index];
      });

      data.push(item);
    });

    return data;
  };

  window.showMemoryStats = function(id, memory, loaded) {
    var options = {
      "type": "serial",
      "theme": "light",
      "path": "http://www.amcharts.com/lib/3/",
      "dataProvider": [],
      "legend": {
        "useGraphSettings": true,
        "valueText": ""
      },
      "valueAxes": [{
        "axisAlpha": 0,
        "position": "right",
        labelFunction: function(value, valueText, valueAxis) {
          return window.humanFileSize(value);
        }
      }],
      "graphs": [{
        "id":"g1",
        "title": "Memory",
        "type": "step",
        "lineThickness": 2,
        "valueField": "memory",
        balloonFunction: function(item) {
          return window.humanFileSize(item.values.value);
        }
      }, {
        "id":"g2",
        "title": "Loaded",
        "type": "step",
        "lineThickness": 2,
        "valueField": "loaded",
        balloonFunction: function(item) {
          return window.humanFileSize(item.values.value);
        }
      }],
      "chartCursor": {
        "fullWidth": true,
        "cursorAlpha": 0.05,
        "graphBulletAlpha": 1
      },
      "categoryField": "step",
      "categoryAxis": {
        "parseDates": false,
      }
    };

    var stats = new Stats(id, options);

    stats.updateData(getData(memory.length, [['memory', memory], ['loaded', loaded]]));

    stats.connectToStream(function(data){
      var memory = data.stats.__memory;
      var loaded = data.stats.__loaded;

      stats.updateData(getData(memory.length, [['memory', memory], ['loaded', loaded]]));
    });
  };

  window.showTimeStats = function(id, time) {
    var options = {
      "type": "serial",
      "titles": [{"text": "Milliseconds to process 1 KB"}],
      "theme": "light",
      "path": "http://www.amcharts.com/lib/3/",
      "dataProvider": [],
      "valueAxes": [{
        "axisAlpha": 0,
        "position": "right"
      }],
      "graphs": [{
        "id":"g1",
        "title": "Memory",
        "type": "step",
        "lineThickness": 2,
        "valueField": "value"
      }],
      "chartCursor": {
        "fullWidth": true,
        "cursorAlpha": 0.05,
        "graphBulletAlpha": 1
      },
      "categoryField": "step",
      "categoryAxis": {
        "parseDates": false,
      }
    };

    var stats = new Stats(id, options);

    stats.updateData(getData(time.length, [['value', time]]));

    stats.connectToStream(function(data){
      var time = data.stats.__tpm;

      stats.updateData(getData(time.length, [['value', time]]));
    });
  };

})();
