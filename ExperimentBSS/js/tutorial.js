(function () {
    var namespace = window.bssExperiment = window.bssExperiment || {};

    namespace.beginTutorial = function () {
        return firstScreen().then(function () {
            return secondScreen();
        }).then(function () {
            return thirdScreen();
        });
    };

    function firstScreen() {
        $('body>*').hide();
        var bar = $('#prepare').data('bar');
        if (!bar) {
            bar = new ProgressBar.Circle('#prepare', {
                easing: 'linear',
                color: '#3498db',
                trailColor: '#d3d3d3',
                strokeWidth: 6,
                trailWidth: 1
            });
        }

        $('#prepare').data('bar', bar);
        bar.set(0);
        $('#prepare').show();
        $('#first_tutorial_screen').show();
        bar.animate(1, {
            duration: bssExperiment.config.preparationTime
        }, onAnimationComplete);

        var deferred = $('#first_tutorial_screen').data('await') || defer();
        $('#first_tutorial_screen').data('await', deferred);
        return deferred.promise;
    }

    function secondScreen() {
        $('body>*').hide();
        $('#symbolBox').show();
        $('#second_tutorial_screen').show();
        return bssExperiment.getUser().then(function (user) {
            var unitKeys = bssExperiment.config.groups[user.group], inputStart, inputEnd;
            if (!Array.isArray(unitKeys)) {
                throw new Error('Invalid config [user.group = ' + user.group + ']: No units found for this group');
            }
            var units = {};
            unitKeys.forEach(function (key) {
                units[key] = bssExperiment.config.units[key];
            });

            $('#second_tutorial_screen').data('units', units);
            displaySymbol();

            var deferred = $('#second_tutorial_screen').data('await') || defer();
            $('#second_tutorial_screen').data('await', deferred);
            return deferred.promise;
        });
    }

    function thirdScreen() {
        $('body>*').hide();
        $('#symbolInput').show();
        $('#symbolInputEntry').focus().attr('placeholder', 'example 1234');
        $('#third_tutorial_screen').show();

        var deferred = $('#third_tutorial_screen').data('await') || defer();
        $('#third_tutorial_screen').data('await', deferred);
        return deferred.promise;
    }

    function displaySymbol() {
        var units = $('#second_tutorial_screen').data('units');
        var symbol = bssExperiment.getRandomString(units, 1);
        $('#symbolBox').text(symbol[0]);
        var timeout = setTimeout(pauseSymbol, bssExperiment.config.symbolTime);
        $('#second_tutorial_screen').data('timeout', timeout);
    }

    function pauseSymbol() {
        $('#symbolBox').text('');
        var timeout = setTimeout(displaySymbol, bssExperiment.config.symbolInBetweentime);
        $('#second_tutorial_screen').data('timeout', timeout);
    }

    function onAnimationComplete() {
        var bar = $('#prepare').data('bar');
        bar.set(0);
        bar.animate(1, {
            duration: bssExperiment.config.preparationTime
        }, onAnimationComplete);
    }

    $(function() {
        $('#continue_to_second_screen').on('click', function () {
            var deferred = $('#first_tutorial_screen').data('await');
            if (!deferred) {
                return;
            }

            $('#first_tutorial_screen').removeData('await');
            deferred.resolve();
        })
    });

    $(function () {
        $('#continue_to_third_screen').on('click', function () {
            var deferred = $('#second_tutorial_screen').data('await');
            if (!deferred) {
                return;
            }

            var timeout = $('#second_tutorial_screen').data('timeout');
            if (timeout != null) {
                clearTimeout(timeout);
            }

            $('#second_tutorial_screen').removeData('await');
            deferred.resolve();
        })
    });

    $(function () {
        $('#finish_tutorial').on('click', function () {
            var deferred = $('#third_tutorial_screen').data('await');
            if (!deferred) {
                return;
            }

            $('#symbolInputEntry').removeAttr('placeholder');

            $('#third_tutorial_screen').removeData('await');
            deferred.resolve();
        })
    });
})();