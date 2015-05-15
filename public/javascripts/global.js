$.document = $(document);

(function() {

    var $container = $('#container');

    var goTo = function(href, cllb) {
        $.ajax({
            url: href,
            complete: function(response) {
                $container.html(response.responseText);

                if (cllb) cllb();
            }
        });
    };

    var linkClicked = function(event) {
        var metaClick = event.metaKey || event.ctrlKey

        if (!metaClick) {
            event.preventDefault();
            History.pushState(null, document.title, this.getAttribute('href'));
        }
    };

    var formSubmited = function(event) {
        var data = new FormData(this);

        var request = new XMLHttpRequest();

        request.open('POST', this.getAttribute('action') || '/');

        request.onload = function(event) {
            History.pushState(null, document.title, request.responseURL);
        };

        request.send(data);

        event.preventDefault();
    };

    History.Adapter.bind(window, 'statechange', function() {
        var State = History.getState();

        goTo(State.hash);
    });

    $.document.on('click', 'a[remote]', linkClicked);
    $.document.on('submit', 'form[remote]', formSubmited);

})();

(function() {

    window.humanFileSize = function(bytes, si) {
        var thresh = si ? 1000 : 1024;

        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }

        var units = si
            ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
            : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];

        var u = -1;

        do {
            bytes /= thresh;
            ++u;
        } while (Math.abs(bytes) >= thresh && u < units.length - 1);

        return bytes.toFixed(1) + ' ' + units[u];
    }

})();
