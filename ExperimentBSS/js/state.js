(function(global, undefined) {
    var namespace = global.bssExperiment = global.bssExperiment || {};

    namespace.State = function(elements) {
        if(elements instanceof Set) {
            this._elements = elements;
        } else if(Array.isArray(elements) || elements instanceof jQuery || elements instanceof HTMLElement) {
            this._elements = getElements(elements);
        } else {
            this._elements = new Set();
        }
    };

    namespace.State.prototype = Object.create(Object.prototype, {
        run: {
            value: function() {
                this._defer = defer();
                $('body *').hide();
                this._elements.forEach(function(element) {
                    $('*', element).show();
                    $(element).show();
                    $(element).parents().show();
                });
                return this._defer.promise;
            }
        }
    });

    namespace.State.Persistent = function() {
        namespace.State.apply(this, arguments);
    };

    namespace.State.Persistent.prototype = Object.create(namespace.State.prototype, {
        run: {
            value: function() {
                var promise = namespace.State.prototype.run.apply(this, arguments);
                this._defer.resolve();
                return promise;
            }
        }
    });

    namespace.State.Choice = function(options) {
        var elements = getElements(options.elements);
        this._map = options.map instanceof Map ? options.map : new Map();
        this._map.forEach(function(item, element) {
            elements.add(element);
        });
        namespace.State.call(this, elements);
    };

    namespace.State.Choice.prototype = Object.create(namespace.State.prototype, {
        run: {
            value: function() {
                this.beginListen();
                return namespace.State.prototype.run.apply(this, arguments);
            }
        },
        beginListen: {
            value: function() {
                this._listener = typeof this._listener === 'function' ? this._listener : this.onAction.bind(this);
                this._map.forEach(function(item, element) {
                    $(element).on('click', this._listener);
                }, this);
            }
        },
        endListen: {
            value:function() {
                if(typeof this._listener === 'function') {
                    this._map.forEach(function(item, element) {
                        $(element).off('click', this._listener);
                    }, this);
                }
            }
        },
        onAction: {
            value: function(event) {
                event.preventDefault();
                if(this._map.has(event.currentTarget)) {
                    this._defer.resolve(this._map.get(event.currentTarget));
                }
            }
        }
    });

    namespace.State.Prepare = function(options) {
        if(typeof options.time !== 'number' || !isFinite(options.time) || options.time < 0) {
            throw new TypeError('Invalid time specified: expected positive number');
        }
        this._timeout = options.time;
        var barElement = document.createElement('div');
        barElement.classList.add('loading');
        document.body.appendChild(barElement);
        var bar = new ProgressBar.Circle(barElement, {
            easing: 'linear',
            duration: options.time,
            color: '#3498db',
            trailColor: '#d3d3d3',
            strokeWidth: 6,
            trailWidth: 1
        });
        this._bar = bar;
        var elements = getElements(options.elements);
        elements.add(barElement);
        namespace.State.call(this, elements);
    };

    namespace.State.Prepare.prototype = Object.create(namespace.State.prototype, {
        run: {
            value: function() {
                if(typeof this._listener !== 'function') {
                    this._listener = this.onComplete.bind(this);
                }
                var promise = namespace.State.prototype.run.apply(this, arguments);
                this._bar.set(0);
                this._bar.animate(1, this._listener);
                return promise;
            }
        },
        onComplete: {
            value: function() {
                this._defer.resolve();
            }
        }
    });

    namespace.State.Symbols = function(options) {
        if(!options.units) {
            throw new TypeError('Units must be given');
        }
        if(typeof options.length !== 'number' || parseInt(options.length) !== options.length || !isFinite(options.length) || options.length < 1) {
            throw new TypeError('Invalid length, expected valid integer >= 1');
        }
        if(typeof options.symbolTime !== 'number' || !isFinite(options.symbolTime) || options.symbolTime < 0) {
            throw new TypeError('Invalid symbolTime specified: expected positive number');
        }
        if(typeof options.pauseTime !== 'number' || !isFinite(options.pauseTime) || options.pauseTime < 0) {
            throw new TypeError('Invalid pauseTime specified: expected positive number');
        }
        if(!(options.textBox instanceof HTMLElement) && !(options.textBox instanceof jQuery && options.textBox.length === 1)) {
            throw new TypeError('Expected element to display the symbols');
        }
        this._units = options.units;
        this._length = options.length;
        this._textBox = options.textBox instanceof jQuery ? options.textBox.get(0) : options.textBox;
        this._symbolTime = options.symbolTime;
        this._pauseTime = options.pauseTime;
        this._currentString = null;
        var elements = getElements(options.elements);
        elements.add(this._textBox);
        namespace.State.call(this, elements);
    };

    namespace.State.Symbols.prototype = Object.create(namespace.State.prototype, {
        getLength: {
            value: function() {
                return this._length;
            }
        },
        setLength: {
            value: function(length) {
                if(typeof length !== 'number' || parseInt(length) !== length || !isFinite(length) || length < 1) {
                    throw new TypeError('Invalid length, expected valid integer >= 1');
                }
                if(this._currentString) {
                    throw new TypeError('Cannot change length while this state is running');
                }
                this._length = length;
            }
        },
        getRamdonString: {
            value: function() {
                var baseTypeIndexMap = Object.keys(this._units);
                var typeCount = baseTypeIndexMap.length;
                var blockCount = Math.floor(Math.floor(this._length / typeCount));
                var blocks = [], block, i, typeIndexMap;

                function fillBlockWithRandomUnit() {
                    var index, typeIndex;
                    typeIndex = Math.floor(Math.random() * typeIndexMap.length);
                    index = Math.floor(Math.random() * this._units[typeIndexMap[typeIndex]].length);
                    block.push(this._units[typeIndexMap[typeIndex]][index]);
                    typeIndexMap.splice(typeIndex, 1);
                }

                while(blocks.length < blockCount) {
                    block = [];
                    typeIndexMap = baseTypeIndexMap.slice(0);
                    while(typeIndexMap.length > 0) {
                        fillBlockWithRandomUnit.call(this);
                    }
                    blocks.push(block);
                }
                block = [];
                i = blocks.length * typeCount;
                typeIndexMap = baseTypeIndexMap.slice(0);
                while(i++ < this._length) {
                    fillBlockWithRandomUnit.call(this);
                }
                blocks.push(block);
                return Array.prototype.concat.apply([], blocks);
            }
        },
        _presentSymbol: {
            value: function() {
                this._textBox.textContent = this._currentString[this._currentIndex];
                setTimeout(this._listenerSymbolEnd, this._symbolTime);
            }
        },
        _onSymbolEnd: {
            value: function() {
                this._textBox.textContent = '';
                setTimeout(this._listenerPauseEnd, this._pauseTime);
            }
        },
        _onPauseEnd: {
            value: function() {
                if(++this._currentIndex >= this._currentString.length) {
                    this._defer.resolve(this._currentString.join(''));
                    this._currentString = null;
                } else {
                    this._presentSymbol();
                }
            }
        },
        run: {
            value: function() {
                this._listenerSymbolEnd = typeof this._listenerSymbolEnd === 'function' ? this._listenerSymbolEnd : this._onSymbolEnd.bind(this);
                this._listenerPauseEnd = typeof this._listenerPauseEnd === 'function' ? this._listenerPauseEnd : this._onPauseEnd.bind(this);
                this._textBox.textContent = '';
                var promise = namespace.State.prototype.run.apply(this, arguments);
                this._currentString = this.getRamdonString();
                this._currentIndex = 0;
                this._presentSymbol();
                return promise;
            }
        }
    });

    namespace.State.Input = function(options) {
        if(!(options.form instanceof HTMLFormElement) && !(options.form instanceof jQuery && options.form.length === 1 && options.form.get(0) instanceof HTMLFormElement)) {
            throw new TypeError('Expected form for user entry');
        }
        if(options.inputKey == null) {
            throw new TypeError('Expected the name of the key of the input element');
        }
        this._transformToUpper = options.transformToUpper === false ? false : true;
        this._form = options.form instanceof jQuery ? options.form.get(0) : options.form;
        var inputKey = options.inputKey;
        if(!(this._form.elements[inputKey] instanceof HTMLInputElement) || this._form.elements[inputKey].type !== 'text') {
            throw new TypeError('Invalid input key, the key given is not an id or name of an input element with type text');
        }
        this._input = this._form.elements[inputKey];
        var elements = getElements(options.elements);
        elements.delete(this._form); /* Form should not be in the elements shown, instead show only the input field */
        elements.add(this._input);
        namespace.State.call(this, elements);
    };

    namespace.State.Input.prototype = Object.create(namespace.State.prototype, {
        _onTextChanged: {
            value: function() {
                if(this._transformToUpper) {
                    this._input.value = this._input.value.toUpperCase();
                }
            }
        },
        _onSubmit: {
            value: function(event) {
                event.preventDefault();
                $(this._input).on('blur', this._listenerLostFocus);
                $(this._input).off('input', this._listenerTextChange);
                $(this._form).off('submit', this._listenerSubmit);
                this._defer.resolve(this._input.value);
            }
        },
        _onFocusLost: {
            value: function(event) {
                event.preventDefault();
                setTimeout(function() {
                    $(this._input).focus();
                }.bind(this), 0);
            }
        },
        run: {
            value: function() {
                this._listenerTextChange = typeof this._listenerTextChange === 'function' ? this._listenerTextChange : this._onTextChanged.bind(this);
                this._listenerSubmit = typeof this._listenerSubmit === 'function' ? this._listenerSubmit : this._onSubmit.bind(this);
                this._listenerLostFocus = typeof this._listenerLostFocus === 'function' ? this._listenerLostFocus : this._onFocusLost.bind(this);
                $(this._form).on('submit', this._listenerSubmit);
                $(this._input).on('input', this._listenerTextChange);
                $(this._input).on('blur', this._listenerLostFocus);
                this._input.value = '';
                var promise = namespace.State.prototype.run.apply(this, arguments);
                $(this._input).focus();
                return promise;
            }
        }
    });

    var defer = function() {
        var d = {};
        d.promise = new Promise(function(resolve, reject) {
            d.resolve = resolve;
            d.reject = reject;
        });
        return d;
    }

    var getElements = function(elementData) {
        var result = new Set(); // Set does not have duplicates
        function arrayExtractor(elementData) {
            elementData.forEach(function(element) {
                if(element instanceof HTMLElement) {
                    addResult(element);
                } else if(element instanceof jQuery) {
                    jQueryExtractor(element);
                } else if(Array.isArray(element)) {
                    arrayExtractor(element);
                }
            });
        }
        function jQueryExtractor(elementData) {
            elementData.each(function(index, element) {
                if(Array.isArray(element)) {
                    arrayExtractor(element);
                } else if(element instanceof HTMLElement) {
                    addResult(element);
                }
            });
        }
        function addResult(element) {
            result.add(element);
        }
        if(elementData instanceof jQuery) {
            jQueryExtractor(elementData);
        } else if(Array.isArray(elementData)) {
            arrayExtractor(elementData);
        } else if(elementData instanceof HTMLElement) {
            addResult(elementData);
        }
        return result;
    };
})(window);