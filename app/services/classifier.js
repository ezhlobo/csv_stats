var titles = {
    number: 'Число',
    date: 'Дата',
    time: 'Время',
    string: 'Строка'
};

var types = [{
    title: titles.number,
    test: function(value) {
        return !isNaN(value);
    }
}, {
    title: titles.date,
    test: function(value) {
        return 'Invalid Date' != new Date(value);
    }
}, {
    title: titles.time,
    test: function(value) {
        return value && 'Invalid Date' != new Date('11.08.2015 ' + value)
    }
}];

module.exports = function(array) {
    var length = array.length;
    var founded = false;
    var i = 0;

    // Check each type until find the right
    while (!founded && i < types.length) {
        var type = types[i];
        var j = 0;

        // For each type check all items in the input array
        for (; j < length; j++) {
            // Test are failed
            if (!type.test(array[j])) {
                break;
            }
        }

        // Test are passed
        if (j === length) {
            founded = true;

            return type.title;
        }

        i++;
    }

    // Default value
    return titles.string;
};
