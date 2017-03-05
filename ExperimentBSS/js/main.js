$(function() {
    function mainMenuActionHandler(action) {
        switch(action) {
            case 'begin':
                return bssExperiment.stateUserForm().then(function(accept) {
                    if(!accept) {
                        return bssExperiment.stateMainMenu().then(mainMenuActionHandler);
                    }
                    return bssExperiment.leaveExperimenterState().then(function() {
                        return bssExperiment.stateStartMenu().then(startMenuActionHandler);
                    });
                });
                break;
            case 'password':
                return bssExperiment.createExperimenterPassword().then(function(isCreated) {
                    return bssExperiment.stateMainMenu().then(mainMenuActionHandler);
                });
                break;
            case 'data':
                return bssExperiment.stateExamineData().then(function() {
                    return bssExperiment.stateMainMenu().then(mainMenuActionHandler);
                });
        }
        return true;
    }

    function startMenuActionHandler(action) {
        switch(action) {
            case 'cancel':
                return bssExperiment.enterExperimenterState().then(function() {
                    return bssExperiment.stateUserForm(true).then(function(accept) {
                        if(accept) {
                            return bssExperiment.leaveExperimenterState().then(function() {
                                return bssExperiment.stateStartMenu().then(startMenuActionHandler);
                            });
                        } else {
                            return bssExperiment.enterExperimenterState().then(function() {
                                return bssExperiment.stateMainMenu().then(mainMenuActionHandler);
                            });
                        }
                    });
                });
            case 'experiment':
                return performExperiment().then(function() {
                    return bssExperiment.enterExperimenterState().then(function() {
                        localStorage.removeItem('justFinished');
                        bssExperiment.clearUserCache();
                        return bssExperiment.stateMainMenu().then(mainMenuActionHandler);
                    });
                });
        }
    }

    function performExperiment() {
        return bssExperiment.getUser().then(function(user) {
            var unitKeys = bssExperiment.config.groups[user.group], inputStart, inputEnd;
            if(!Array.isArray(unitKeys)) {
                throw new Error('Invalid config [user.group = ' + user.group + ']: No units found for this group');
            }
            var units = {};
            unitKeys.forEach(function(key) {
                units[key] = bssExperiment.config.units[key];
            });
            var length = bssExperiment.config.initialLength, errorCount = 0;
            if(typeof length !== 'number' || !isFinite(length) || length !== parseInt(length) || length < 1) {
                throw new Error('Invalid config [initialLength = ' + length + '] is not valid initial length: expected valid integer >= 1');
            }
            function iteration() {
                var sequenceInfo = {};
                return bssExperiment.statePrepare(bssExperiment.config.preparationTime).then(function() {
                    return bssExperiment.stateSymbolPresentation(units, length);
                }).then(function(source) {
                    sequenceInfo.source = source;
                    inputStart = Date.now();
                    return bssExperiment.stateSymbolInput();
                }).then(function(input) {
                    inputEnd = Date.now();
                    sequenceInfo.input = input;
                    return sequenceInfo;
                });
            }
            function conditionHandle(info) {
                return bssExperiment.insertData({
                    userId: user.id,
                    originalString: info.source,
                    userString: info.input,
                    inputStart: inputStart + '',
                    inputEnd: inputEnd + ''
                }).then(function() {
                    if(bssExperiment.freeRecallCompare(info.source, info.input)) {
                        ++length;
                        errorCount = 0;
                    } else {
                        if(++errorCount >= bssExperiment.config.allowedErrors) {
                            return bssExperiment.leaveExperiment().then(function() {
                                localStorage.setItem('justFinished', '1');
                                bssExperiment.clearUserCache();
                                return bssExperiment.stateFinished();
                            });
                        }
                    }
                    return iteration().then(conditionHandle);
                });
            }
            return bssExperiment.enterExperiment().then(function() {
                return iteration().then(conditionHandle);
            });
        });
    };

    function checkState() {
        if(!bssExperiment.hasExperimentPassword()) {
            // We have no password, show the main menu
            return bssExperiment.enterExperimenterState().then(function() {
                return bssExperiment.stateMainMenu().then(mainMenuActionHandler);
            });
        }
        if(localStorage.getItem('justFinished') != null) {
            return bssExperiment.leaveExperimenterState().then(function() {
                return bssExperiment.stateFinished().then(function() {
                    return bssExperiment.enterExperimenterState().then(function() {
                        localStorage.removeItem('justFinished');
                        bssExperiment.clearUserCache();
                        return bssExperiment.stateMainMenu().then(mainMenuActionHandler);
                    });
                });
            });
        }
        return bssExperiment.getUser().then(function(user) {
            if(user) {
                if(bssExperiment.isInExperiment()) {
                    return bssExperiment.stateInterrupted().then(function() {
                        return bssExperiment.enterExperimenterState();
                    }).then(function() {
                        return bssExperiment.clearDataForUser(user.id);
                    }).then(function() {
                        return bssExperiment.leaveExperiment();
                    }).then(function() {
                        return bssExperiment.leaveExperimenterState();
                    }).then(function() {
                        return bssExperiment.stateStartMenu().then(startMenuActionHandler);
                    });
                }
                return bssExperiment.leaveExperimenterState().then(function() {
                    return bssExperiment.stateStartMenu().then(startMenuActionHandler);
                });
            }
            return bssExperiment.enterExperimenterState().then(function() {
                return bssExperiment.stateMainMenu().then(mainMenuActionHandler);
            });
        });
    }

    bssExperiment.showLoadingMessage('Loading database...');
    bssExperiment.initDatabase()
        .then(checkState)
        .catch(function(err) {
            bssExperiment.onError(err);
        });
});