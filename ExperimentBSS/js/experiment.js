(function() {
    var namespace = window.bssExperiment = window.bssExperiment || {};

    namespace.statePrepare = function(time) {
        if(typeof time !== 'number' || !isFinite(time) || time < 0) {
            return Promise.reject(new Error('Invalid amount of waiting time specified: expected positive integer'));
        }
        var bar = $('#prepare').data('bar');
        if(!bar) {
            bar = new ProgressBar.Circle('#prepare', {
                easing: 'linear',
                color: '#3498db',
                trailColor: '#d3d3d3',
                strokeWidth: 6,
                trailWidth: 1
            });
            $('#prepare').data('bar', bar);
        }
        var deferred = $('#prepare').data('await') || defer();
        $('#prepare').data('await', deferred);
        bar.set(0);
        $('body>*').hide();
        $('#prepare').show();
        bar.animate(1, {
            duration: time
        }, function() {
            deferred.resolve();
        });
        return deferred.promise;
    };

    namespace.stateSymbolPresentation = function(units, length) {
        if(!units) {
            return Promise.reject(new TypeError('Units must be given'));
        }
        if(typeof length !== 'number' || !isFinite(length) || parseInt(length) !== length || length < 1) {
            return Promise.reject(new TypeError('Invalid length, expected valid integer >= 1'));
        }
        var symbolBox = $('#symbolBox');
        $('body>*').hide();
        symbolBox.text('').show();
        var deferred = symbolBox.data('await') || defer();
        symbolBox.data('await', deferred);
        var sequence = bssExperiment.getRandomString(units, length);
        symbolBox.data('sequence', sequence);
        symbolBox.data('index', 0);
        displaySymbol();
        return deferred.promise;
    };

    function displaySymbol() {
        var symbolBox = $('#symbolBox');
        var sequence = symbolBox.data('sequence');
        var index = symbolBox.data('index');
        if(index >= sequence.length) {
            var deferred = symbolBox.data('await');
            symbolBox.removeData('sequence').removeData('index').removeData('await');
            return void deferred.resolve(sequence.join(''));
        }
        symbolBox.text(sequence[index++]).data('index', index);
        setTimeout(pauseSymbol, bssExperiment.config.symbolTime);
    }

    function pauseSymbol() {
        $('#symbolBox').text('');
        setTimeout(displaySymbol, bssExperiment.config.symbolInBetweentime);
    }

    namespace.getRandomString = function(units, length) {
        var baseTypeIndexMap = Object.keys(units);
        var typeCount = baseTypeIndexMap.length;
        var blockCount = Math.floor(Math.floor(length / typeCount));
        var blocks = [], block, i, typeIndexMap;

        function fillBlockWithRandomUnit() {
            var index, typeIndex;
            typeIndex = Math.floor(Math.random() * typeIndexMap.length);
            index = Math.floor(Math.random() * units[typeIndexMap[typeIndex]].length);
            block.push(units[typeIndexMap[typeIndex]][index]);
            typeIndexMap.splice(typeIndex, 1);
        }

        while(blocks.length < blockCount) {
            block = [];
            typeIndexMap = baseTypeIndexMap.slice(0);
            while(typeIndexMap.length > 0) {
                fillBlockWithRandomUnit();
            }
            blocks.push(block);
        }
        block = [];
        i = blocks.length * typeCount;
        typeIndexMap = baseTypeIndexMap.slice(0);
        while(i++ < length) {
            fillBlockWithRandomUnit();
        }
        blocks.push(block);
        return Array.prototype.concat.apply([], blocks);
    };

    namespace.freeRecallCompare = function(s1, s2) {
        if(s1.length !== s2.length) {
            return false;
        }
        var c, i;
        while(s1.length > 0 || s2.length > 0) {
            c = s1.charAt(0);
            s1 = s1.substr(1);
            i = s2.indexOf(c);
            if(i < 0) {
                return false;
            }
            s2 = s2.substr(0, i) + s2.substr(i + 1);
        }
        return s1.length === s2.length;
    }

    function symbolInputFocusLost(event) {
        event.preventDefault();
        setTimeout(function() {
            $(event.currentTarget).focus();
        }.bind(this), 0);
    }

    function symbolEntryTextChanged(event) {
        $(event.currentTarget).val($(event.currentTarget).val().toUpperCase());
    }

    namespace.stateSymbolInput = function() {
        $('body>*').hide();
        $('#symbolInput').show();
        var deferred = $('#symbolInput').data('await') || defer();
        $('#symbolInput').data('await', deferred);
        $('#symbolInput').get(0).reset();
        $('#symbolInputEntry').on('blur', symbolInputFocusLost);
        $('#symbolInputEntry').on('input', symbolEntryTextChanged);
        $('#symbolInputEntry').focus();
        return deferred.promise;
    };

    namespace.enterExperiment = function() {
        $('body').addClass('disable-mouse');
        localStorage.setItem('inExperiment', '1');
        return Promise.resolve();
    };

    namespace.leaveExperiment = function() {
        $('body').removeClass('disable-mouse');
        localStorage.removeItem('inExperiment');
        return Promise.resolve();
    };

    namespace.isInExperiment = function() {
        var experimentState = localStorage.getItem('inExperiment');
        return experimentState != null;
    };

    namespace.stateFinished = function() {
        var form = $('#experimentFinished');
        $('body>*').hide();
        form.show();
        var deferred = form.data('await') || defer();
        form.data('await', deferred);
        return deferred.promise;
    }

    namespace.stateInterrupted = function() {
        var form = $('#experimentInterrupted');
        $('body>*').hide();
        form.show();
        var deferred = form.data('await') || defer();
        form.data('await', deferred);
        return deferred.promise;
    }

    $(function() {
        $('#symbolInput').on('submit', function(event) {
            event.preventDefault();
            var deferred = $(event.currentTarget).data('await');
            if(!deferred) {
                return;
            }
            $('#symbolInputEntry').off('input', symbolEntryTextChanged);
            $('#symbolInputEntry').off('blur', symbolInputFocusLost);
            $(event.currentTarget).removeData('await');
            deferred.resolve($('#symbolInputEntry').val());
        });
        $('#experimentInterrupted').on('submit', function(event) {
            event.preventDefault();
            var deferred = $(event.currentTarget).data('await');
            if(!deferred) {
                return;
            }
            bssExperiment.enterExperimenterState().then(function(accepted) {
                if(accepted) {
                    $(event.currentTarget).removeData('await');
                    deferred.resolve();
                }
            }).catch(function(err) {
                deferred.reject(err);
            })
        });
        $('#experimentFinished').on('submit', function(event) {
            event.preventDefault();
            var deferred = $(event.currentTarget).data('await');
            if(!deferred) {
                return;
            }
            bssExperiment.enterExperimenterState().then(function(accepted) {
                if(accepted) {
                    $(event.currentTarget).removeData('await');
                    deferred.resolve();
                }
            }).catch(function(err) {
                deferred.reject(err);
            })
        });
    });
})();