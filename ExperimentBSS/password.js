$(function() {
    var namespace = global.bssExperiment = global.bssExperiment || {};
    namespace.hasExperimentPassword = function() {
        var passwordHash = localStorage.getItem('password');
        return typeof passwordHash === 'string' && passwordHash.length > 0;
    };
    namespace.isExperimenter = function() {
        var isExperimenter = localStorage.getItem('experimenter');
        return isFinite(isExperimenter) && isExperimenter > 0;
    };
    namespace.enterExperimenterState = function() {
        if(isExperimenter) {
            return Promise.resolve();
        }
        return namespace.requestExperimenterState();
    };
    namespace.createExperimenterPassword = function() {
        function showCreatePasswordScreen() {
            $('.modal-cover').show();
            $('#createPasswordScreen').show();
            var deferred = $('#createPasswordScreen').data('await') || defer();
            $('#createPasswordScreen').data('await', deferred);
            return deferred.promise;
        }
        if(bssExperiment.hasExperimentPassword()) {
            return namespace.enterExperimenterState().then(function(isExperimenter) {
                if(isExperimenter) {
                    return showCreatePasswordScreen();
                }
                return false;
            });
        }
        return showCreatePasswordScreen();
    }

    function defer() {
        var deferred = {};
        deferred.promise = new Promise(function(resolve, reject) {
            deferred.resolve = resolve;
            deferred.reject = reject;
        });
        return deferred;
    }

    $('#createPasswordScreen').on('submit', function(event) {
        event.preventDefault();
        var defer = $(event.currentTarget).data('await');
        if(defer) {
            // TODO: perform something on submit of the form
        }
    });
    $('#createPasswordScreen').on('reset', function(event) {
        event.preventDefault();
        var defer = $(event.currentTarget).data('await');
        if(defer) {
            // TODO: perform something on submit of the form
            event.currentTarget.reset();
            $('.modal-cover').hide();
            $('#createPasswordScreen').hide();
            defer.resolve(false);
        }
    });
});