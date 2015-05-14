module.exports = (function() {
    function app() {
        this.store = {};
        this.store_keys = [];
    }

    app.prototype = {};

    app.prototype.put = function(key, value) {
        if (!this.store[key]) {
            this.store_keys.push(key);
        }

        this.store[key] = value;
    };

    app.prototype.size = function() {
        return this.store_keys.length;
    };

    app.prototype.keys = function() {
        return this.store_keys;
    };

    app.prototype.get = function(key) {
        return this.store[key];
    };

    return app;
})();
