(function() {
    var namespace = window.bssExperiment = window.bssExperiment || {};
    namespace.hasExperimentPassword = function() {
        var passwordHash = localStorage.getItem('password');
        return typeof passwordHash === 'string' && passwordHash.length > 0;
    };
    namespace.isExperimenter = function() {
        var isExperimenter = localStorage.getItem('experimenter');
        return isExperimenter === 'true';
    };
    namespace.enterExperimenterState = function() {
        if(namespace.isExperimenter()) {
            return Promise.resolve(true);
        }
        return namespace.requestExperimenterState();
    };
    namespace.leaveExperimenterState = function() {
        localStorage.removeItem('experimenter');
        return Promise.resolve(true);
    };
    namespace.requestExperimenterState = function() {
        if(!bssExperiment.hasExperimentPassword()) {
            return Promise.resolve(true); // Experimenter must create password before continue.
        }
        return showCheckPasswordScreen();
    };
    namespace.createExperimenterPassword = function() {
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

    function showCreatePasswordScreen() {
        clearCreatePasswordError();
        $('.modal-cover').show();
        $('#createPasswordScreen').show();
        var deferred = $('#createPasswordScreen').data('await') || defer();
        $('#createPasswordScreen').data('await', deferred);
        return deferred.promise;
    }

    function hideCreatePasswordScreen() {
        $('#createPasswordScreen').get(0).reset();
        $('.modal-cover').hide();
        $('#createPasswordScreen').hide();
    }

    function disableCreatePasswordControls() {
        $('#createPasswordScreen').data('disabled', true);
    }

    function enableCreatePasswordControls() {
        $('#createPasswordScreen').data('disabled', false);
    }

    function clearCreatePasswordError() {
        $('#createPasswordScreen>.error>*').hide();
    }

    function showCreatePasswordEmptyError() {
        $('#createPasswordScreen>.error>*').hide();
        $('#createPasswordScreen>.error>.password-empty').show();
    }

    function showCreatePasswordMismatchError() {
        $('#createPasswordScreen>.error>*').hide();
        $('#createPasswordScreen>.error>.password-mismatch').show();
    }

    function showCheckPasswordScreen() {
        clearCheckPasswordError();
        $('.modal-cover').show();
        $('#checkPasswordScreen').show();
        var deferred = $('#checkPasswordScreen').data('await') || defer();
        $('#checkPasswordScreen').data('await', deferred);
        return deferred.promise;
    }

    function hideCheckPasswordScreen() {
        $('#checkPasswordScreen').get(0).reset();
        $('.modal-cover').hide();
        $('#checkPasswordScreen').hide();
    }

    function disableCheckPasswordControls() {
        $('#checkPasswordScreen').data('disabled', true);
    }

    function enableCheckPasswordControls() {
        $('#checkPasswordScreen').data('disabled', false);
    }

    function clearCheckPasswordError() {
        $('#checkPasswordScreen>.error>*').hide();
    }

    function showCheckPasswordEmptyError() {
        $('#checkPasswordScreen>.error>*').hide();
        $('#checkPasswordScreen>.error>.password-empty').show();
    }

    function showCheckPasswordMismatchError() {
        $('#checkPasswordScreen>.error>*').hide();
        $('#checkPasswordScreen>.error>.password-mismatch').show();
    }

    $(function() {
        $('#createPasswordScreen').on('submit', function(event) {
            event.preventDefault();
            if($(event.currentTarget).data('disabled')) {
                return;
            }
            var defer = $(event.currentTarget).data('await');
            if(defer) {
                var currentPassword = event.currentTarget.elements.password.value;
                var repeatPassword = event.currentTarget.elements.repeatPassword.value;
                if(currentPassword.length <= 0) {
                    return void showCreatePasswordEmptyError();
                }
                if(currentPassword !== repeatPassword) {
                    return void showCreatePasswordMismatchError();
                }
                disableCreatePasswordControls();
                sha512(currentPassword).then(function(password) {
                    enableCreatePasswordControls();
                    localStorage.setItem('password', password);
                    $(event.currentTarget).removeData('await');
                    defer.resolve(true);
                    hideCreatePasswordScreen();
                }).catch(function(err) {
                    enableCreatePasswordControls();
                    hideCreatePasswordScreen();
                    defer.reject(err);
                });
            }
        });
        $('#createPasswordScreen').on('reset', function(event) {
            if($(event.currentTarget).data('disabled')) {
                return;
            }
            var defer = $(event.currentTarget).data('await');
            if(defer) {
                $(event.currentTarget).removeData('await');
                hideCreatePasswordScreen();
                defer.resolve(false);
            }
        });

        $('#checkPasswordScreen').on('submit', function(event) {
            event.preventDefault();
            if($(event.currentTarget).data('disabled')) {
                return;
            }
            var defer = $(event.currentTarget).data('await');
            if(defer) {
                var password = event.currentTarget.elements.password.value;
                if(password.length <= 0) {
                    return void showCheckPasswordEmptyError();
                }
                disableCheckPasswordControls();
                sha512(password).then(function(password) {
                    enableCheckPasswordControls();
                    var originalPassword = localStorage.getItem('password');
                    if(password !== originalPassword) {
                        return void showCheckPasswordMismatchError();
                    }
                    $(event.currentTarget).removeData('await');
                    localStorage.setItem('experimenter', true);
                    defer.resolve(true);
                    hideCheckPasswordScreen();
                }).catch(function(err) {
                    enableCheckPasswordControls();
                    hideCheckPasswordScreen();
                    defer.reject(err);
                });
            }
        });
        $('#checkPasswordScreen').on('reset', function(event) {
            if($(event.currentTarget).data('disabled')) {
                return;
            }
            var defer = $(event.currentTarget).data('await');
            if(defer) {
                $(event.currentTarget).removeData('await');
                hideCheckPasswordScreen();
                defer.resolve(false);
            }
        });

        hideCreatePasswordScreen();
        hideCheckPasswordScreen();
    });
})();