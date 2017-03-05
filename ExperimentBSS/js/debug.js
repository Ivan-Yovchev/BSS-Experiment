(function() {
    var namespace = window.bssExperiment = window.bssExperiment || {};

    showDebugScreen = function() {
        $('body>*').hide();
        $('#debug').show();
        $('#debug .loading-bar').each(function(index, element) {
            if(!$(element).data('progressBar')) {
                var loading = new ProgressBar.Circle(element, {
                    color: '#3498db',
                    trailColor: 'rgba(0, 0, 0, 0)',
                    strokeWidth: 6,
                    duration: 2500,
                    easing: 'easeInOut'
                });
                $(element).data('progressBar', loading);
                loading.set(0.25);
            }
        });
        $('#debug .loading-bar').hide();
        $('#debug .message').text('');
    };

    hideDebugScreen = function() {
        $('#debug').hide();
    };

    function messageFactory(withLoading) {
        return function() {
            showDebugScreen();
            if(withLoading) {
                $('#debug .loading-bar').show();
            } else {
                $('#debug .loading-bar').hide();
            }
            var texts = [];
            Array.prototype.forEach.call(arguments, function(text) {
                if(text != null) {
                    text = '' + text;
                    texts.push($('<div />').text(text));
                }
            });
            if(texts.length <= 0) {
                $('#debug .message').text('').show();
            } else {
                $('#debug .message').empty().show().append(texts);
            }
        }
    }

    namespace.showLoadingMessage = messageFactory(true);
    namespace.showErrorMessage = messageFactory(false);
    namespace.hideMessages = function() {
        $('#debug').hide();
    };
})();