(function() {
    var namespace = window.bssExperiment = window.bssExperiment || {};

    namespace.stateMainMenu = function() {
        showMainMenu();
        var deferred = $('#mainMenu').data('await') || defer();
        $('#mainMenu').data('await', deferred);
        return deferred.promise;
    }

    namespace.stateStartMenu = function() {
        return bssExperiment.getUser().then(function(user) {
            if(!user) {
                return false;
            }
            $('#startMenuInfoUserName').text(user.name);
            $('#startMenuInfoGroup').text(user.group);
            showStartMenu();
            var deferred = $('#startMenu').data('await') || defer();
            $('#startMenu').data('await', deferred);
            return deferred.promise;
        });
    }

    function showMainMenu() {
        $('body>*').hide();
        $('#mainMenu').show();
        if(!bssExperiment.hasExperimentPassword()) {
            $('#menuBeginExperiment').hide();
            $('#menuExamineData').hide();
        } else {
            $('#menuBeginExperiment').show();
            $('#menuExamineData').show();
        }
    }

    function showStartMenu() {
        $('body>*').hide();
        $('#startMenu').show();
    }

    $(function() {
        $('#menuBeginExperiment').on('click', function() {
            var deferred = $('#mainMenu').data('await');
            if(!deferred) {
                return;
            }
            $('#mainMenu').removeData('await');
            deferred.resolve('begin');
        });
        $('#menuCreatePassword').on('click', function() {
            var deferred = $('#mainMenu').data('await');
            if(!deferred) {
                return;
            }
            $('#mainMenu').removeData('await');
            deferred.resolve('password');
        });
        $('#menuExamineData').on('click', function() {
            var deferred = $('#mainMenu').data('await');
            if(!deferred) {
                return;
            }
            $('#mainMenu').removeData('await');
            deferred.resolve('data');
        });
        $('#startMenuBeginSequence').on('click', function() {
            var deferred = $('#startMenu').data('await');
            if(!deferred) {
                return;
            }
            $('#startMenu').removeData('await');
            deferred.resolve('experiment');
        });
        $('#startMenuCancel').on('click', function() {
            var deferred = $('#startMenu').data('await');
            if(!deferred) {
                return;
            }
            return bssExperiment.enterExperimenterState().then(function(identified) {
                if(identified) {
                    $('#startMenu').removeData('await');
                    deferred.resolve('cancel');
                }
            });
        });
        $('#startMenuBeginTutorial').on('click', function () {
            var deferred = $('#startMenu').data('await');
            if (!deferred) {
                return;
            }
            $('#startMenu').removeData('await');
            deferred.resolve('tutorial');
        });
    });
})();