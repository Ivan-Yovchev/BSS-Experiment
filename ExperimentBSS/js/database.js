(function() {
    var namespace = window.bssExperiment = window.bssExperiment || {};
    var database;

    namespace.initDatabase = function() {
        if(!window.indexedDB) {
            return Promise.reject(new Error('Indexed database is not supported by this browser'));
        }
        if(database) {
            return Promise.resolve();
        }
        return new Promise(function(resolve, reject) {
            // The number is the version database, if we change the table structure in the future, increment that to next version
            var request = indexedDB.open('experiment', 1);
            request.onerror = function(event) {
                reject(error);
            };
            request.onsuccess = function(event) {
                request.result.onerror = null;
                database = request.result;
                resolve();
                // Return the IDBDatabase object. Call to IDBDatabase.transaction(...) to obtain a transaction.
                // Call to IDBDatabase.close() when it is finished.
            };
            request.onupgradeneeded = function(event) {
                // Initially there is no "experiment" database, so it is created. As every SQL database, it has no tables.
                var db = this.result;
                db.onerror = function(event) {
                    reject(db.error);
                }
                for(var i = event.oldVersion + 1; i <= event.newVersion; ++i) {
                    databaseMigration[i](db);
                }
            };
        });
    }

    namespace.addUser = function(data) {
        if(!data) {
            return Promise.reject(new Error('Object for new user not provided'));
        }
        if(typeof data.name !== 'string' || data.name.length <= 0) {
            return Promise.reject('The name of the user cannot be empty.');
        }
        if(typeof data.group !== 'string' && bssExperiment.config.groups.hasOwnProperty(data.group)) {
            return Promise.reject('The user must be assigned to a group specified in the configuration.');
        }
        if(!database) {
            return initDatabase().then(function() {
                bssExperiment.addUser(data);
            });
        }
        var dbUser = {
            name: data.name,
            group: data.group,
            testedOn: Date.now() + ''
        };
        return new Promise(function(resolve, reject) {
            var trans = database.transaction('user', 'readwrite');
            trans.onerror = function(event) {
                reject(trans.error);
            }
            trans.oncomplete = function(event) {
                resolve(request.result);
            }
            var request = trans.objectStore('user').add(dbUser);
        }).then(function(userId) {
            localStorage.setItem('userId', userId);
            dbUser.id = userId;
            $('body').data('user', dbUser);
            return userId;
        });
    };

    namespace.storeUserResult = function(length) {
        return bssExperiment.getUser().then(function(user) {
            var trans = database.transaction('user', 'readwrite');
            trans.onerror = function(event) {
                reject(trans.error);
            };
            trans.oncomplete = function(event) {
                resolve(request.result);
            };
            user.rememberedItems = length;
            var request = trans.objectStore('user').put(user);
        });
    };

    namespace.updateUser = function(data) {
        if(!data) {
            return Promise.reject(new Error('Object for new user not provided'));
        }
        if(typeof data.id !== 'number' || !isFinite(data.id) || data.id <= 0) {
            return Promise.reject('Updating existing user requires ID.');
        }
        if(typeof data.name !== 'string' || data.name.length <= 0) {
            return Promise.reject('The name of the user cannot be empty.');
        }
        if(typeof data.group !== 'string' && bssExperiment.config.groups.hasOwnProperty(data.group)) {
            return Promise.reject('The user must be assigned to a group specified in the configuration.');
        }
        var dbUser = {
            id: data.id,
            name: data.name,
            group: data.group,
            testedOn: Date.now() + ''
        };
        return new Promise(function(resolve, reject) {
            var trans = database.transaction('user', 'readwrite');
            trans.onerror = function(event) {
                reject(trans.error);
            }
            trans.oncomplete = function(event) {
                resolve(request.result);
            }
            var request = trans.objectStore('user').put(dbUser);
        }).then(function(userId) {
            localStorage.setItem('userId', userId);
            $('body').data('user', dbUser);
            return userId;
        });
    }

    namespace.getUser = function() {
        var user = $('body').data('user');
        if(user) {
            return Promise.resolve(user);
        }
        var id = localStorage.getItem('userId');
        if(id == null) {
            return Promise.resolve(null);
        }
        id = parseInt(id);
        if(!isFinite(id) || id <= 0) {
            return Promise.resolve(null);
        }
        if(!database) {
            return initDatabase().then(function() {
                bssExperiment.getUser(id);
            });
        }
        return new Promise(function(resolve, reject) {
            var trans = database.transaction('user', 'readonly');
            trans.onerror = function(event) {
                reject(trans.error);
            };
            trans.oncomplete = function(event) {
                var dbUser = request.result;
                $('body').data('user', dbUser);
                resolve(request.result || null);
            };
            var request = trans.objectStore('user').get(id);
        });
    }

    namespace.insertData = function(data) {
        return new Promise(function(resolve, reject) {
            var trans = database.transaction('data', 'readwrite');
            trans.onerror = function(event) {
                reject(trans.error);
            };
            trans.oncomplete = function(event) {
                resolve(request.result);
            };
            var request = trans.objectStore('data').add(data);
        });
    };

    namespace.clearDataForUser = function(userId) {
        return new Promise(function(resolve, reject) {
            var entriesDeleted = 0;
            var trans = database.transaction('data', 'readwrite');
            trans.onerror = function(event) {
                reject(trans.error);
            }
            trans.oncomplete = function(event) {
                resolve(entriesDeleted);
            }
            var store = trans.objectStore('data');
            var index = store.index('data_userId');
            var request = index.openCursor(IDBKeyRange.only(userId));
            request.onsuccess = function(event) {
                var cursor = request.result;
                if(cursor) {
                    cursor.delete().onsuccess = function() {
                        entriesDeleted++;
                    };
                    cursor.continue();
                }
            };
        });
    };

    namespace.getData = function() {
        return new Promise(function(resolve, reject) {
            var userMap = new Map(), data = [];
            var trans = database.transaction(['data', 'user'], 'readonly');
            trans.onerror = function(event) {
                reject(trans.error);
            };
            trans.oncomplete = function(event) {
                resolve(data);
            };
            var userStore = trans.objectStore('user');
            var dataStore = trans.objectStore('data');
            var dataUserIdIndex = dataStore.index('data_userId');
            userStore.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if(cursor) {
                    var id = cursor.value.id;
                    userMap.set(id, cursor.value);
                    cursor.continue();
                } else {
                    dataUserIdIndex.openCursor(null, 'next').onsuccess = function(event) {
                        var cursor = event.target.result;
                        if(cursor) {
                            var row = cursor.value;
                            if(row.userId != null && userMap.has(row.userId)) {
                                row.user = userMap.get(row.userId);
                            } else {
                                row.user = null;
                            }
                            data.push(row);
                            cursor.continue();
                        }
                    };
                }
            };
        });
    };

    namespace.clearUserCache = function() {
        $('body').removeData('user');
        localStorage.removeItem('userId');
    };

    var databaseMigration = [,
        function(db) {
            var dataTable = db.createObjectStore('data', {
                keyPath: 'id', // This is the primary key in the table (note, it is not a key, but keyPath, unlike SQL this could store nested objects)
                autoIncrement: true
            });
            dataTable.createIndex('data_userId', 'userId', {
                unique: false
            });
            dataTable.createIndex('data_group', 'group', {
                unique: false
            });
            var userTable = db.createObjectStore('user', {
                keyPath: 'id',
                autoIncrement: true
            });
            userTable.createIndex('user_name', 'name', {
                unique: false
            });
        }
    ];
})();