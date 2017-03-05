(function() {
    var namespace = window.bssExperiment = window.bssExperiment || {};

    namespace.stateUserForm = function(edit) {
        if(!bssExperiment.hasExperimentPassword()) {
            return Promise.resolve(false);
        }
        return bssExperiment.getUser().then(function(user) {
            if(user) {
                if(!edit) {
                    return true;
                }
                fillValues(user);
                $('#userForm').data('edit', true);
            } else {
                $('#userForm').data('edit', false);
            }
            showUserForm();
            var deferred = $('#userForm').data('await') || defer();
            $('#userForm').data('await', deferred);
            return deferred.promise;
        });
    }

    function showUserForm() {
        clearErrors();
        $('body>*').hide();
        $('#userForm').show();
    }

    function hideUserForm() {
        $('#userForm').hide();
    }

    function disableControls() {
        $('#userForm').data('disabled', true);
    }

    function enableControls() {
        $('#userForm').data('disabled', false);
    }

    function clearErrors() {
        $('#userForm>.error>*').hide();
    }

    function showNameRequiredError() {
        clearErrors();
        $('#userForm>.error>.name-required').show();
    }

    function showGroupRequiredError() {
        clearErrors();
        $('#userForm>.error>.group-required').show();
    }

    function fillValues(user) {
        var form = $('#userForm').get(0), i, length, e;
        form.reset();
        form.elements.name.value = user.name;
        for(i = 0, length = form.elements.group.length; i < length; ++i) {
            e = form.elements.group.item(i);
            e.checked = e.value === user.group;
        }
    }

    function getGroupValue(form) {
        var i, length = form.elements.group.length;
        for(i = 0; i < length; ++i) {
            if(form.elements.group.item(i).checked) {
                return form.elements.group.item(i).value;
            }
        }
        return null;
    }

    $(function() {
        $('#userForm').on('submit', function(event) {
            event.preventDefault();
            if($(event.currentTarget).data('disabled')) {
                return;
            }
            var deferred = $(event.currentTarget).data('await');
            if(!deferred) {
                return;
            }
            var userName = event.currentTarget.elements.name.value;
            userName = userName == null ? '' : userName;
            userName = '' + userName;
            userName = userName.trim();
            if(userName.length <= 0) {
                showNameRequiredError();
                return;
            }
            var group = getGroupValue(event.currentTarget);
            if(group == null) {
                showGroupRequiredError();
                return;
            }
            disableControls();
            var edit = $('#userForm').data('edit');
            var promiseChain;
            if(edit) {
                promiseChain = bssExperiment.getUser().then(function(user) {
                    if(!user) {
                        return bssExperiment.addUser({
                            name: userName,
                            group: group
                        });
                    }
                    return bssExperiment.updateUser({
                        id: user.id,
                        name: userName,
                        group: group
                    });
                });
            } else {
                promiseChain = bssExperiment.addUser({
                    name: userName,
                    group: group
                })
            }
            promiseChain.then(function(userId) {
                enableControls();
                console.log('[Database] userId: %d', userId);
                $(event.currentTarget).removeData('await');
                $(event.currentTarget).removeData('edit');
                deferred.resolve(true);
            }).catch(function(err) {
                deferred.reject(err);
            });
        });
        $('#userForm').on('reset', function(event) {
            if($(event.currentTarget).data('disabled')) {
                return;
            }
            var deferred = $(event.currentTarget).data('await');
            if(!deferred) {
                return;
            }
            hideUserForm();
            $(event.currentTarget).removeData('await');
            deferred.resolve(false);
        });
        
        $('#userForm .control-group').controlgroup();
        $('#userForm input[type="radio"]').checkboxradio({
            icon: false
        });
    });
})();