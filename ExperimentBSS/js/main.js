$(function() {
    function createGroupScreen() {
        var options = {
            elements: [
                $('#group_select_text')
            ],
            map: new Map()
        };
        $('#group_buttons>.group-button').each(function(index, button) {
            var key = $(button).val();
            var group = bssExperiment.config.groups[key];
            options.map.set(button, group);
        });
        return new bssExperiment.State.Choice(options);
    }

    function createPrepareScreen() {
        return new bssExperiment.State.Prepare({
            time: bssExperiment.config.preparationTime
        });
    }

    function createSymbolScreen(units) {
        return new bssExperiment.State.Symbols({
            units: units,
            length: 3,
            symbolTime: bssExperiment.config.symbolTime,
            pauseTime: bssExperiment.config.symbolInBetweentime,
            textBox: $('#textWindow')
        });
    }

    function createInputScreen() {
        return new bssExperiment.State.Input({
            form: $('#userForm'),
            inputKey: 'sequence'
        });
    }

    function createFinalScreen() {
        return new bssExperiment.State.Persistent([
            $('#experimentOver')
        ]);
    }

    function runTestChain() {
        var units = {};
        var steps = {
            group: createGroupScreen(),
            prepare: createPrepareScreen(),
            input: createInputScreen(),
            final: createFinalScreen()
        };
        var errorCount = 0;
        function iteration() {
            var sequenceInfo = {};
            return steps.prepare.run().then(function() {
                return steps.symbols.run();
            }).then(function(sequence) {
                sequenceInfo.source = sequence;
                return steps.input.run();
            }).then(function(sequence) {
                sequenceInfo.user = sequence;
                return sequenceInfo;
            });
        }
        function conditionHandle(info) {
            if(info.source === info.user) {
                steps.symbols.setLength(steps.symbols.getLength() + 1);
                errorCount = 0;
            } else {
                if(++errorCount >= bssExperiment.config.allowedErrors) {
                    return steps.final.run();
                }
            }
            return iteration().then(conditionHandle);
        }
        steps.group.run().then(function(group) {
            group.forEach(function(key) {
                units[key] = bssExperiment.config.units[key];
            });
            steps.symbols = createSymbolScreen(units);
            return iteration().then(conditionHandle);
        }).then(function() {
            return steps.symbols.getLength();
        });
    }

    runTestChain();
});