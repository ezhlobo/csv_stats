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
