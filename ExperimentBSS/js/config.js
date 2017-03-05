(function(global, undefined) {
    var namespace = global.bssExperiment = global.bssExperiment || {};

    bssExperiment.config = {
        /* Contains a lists of symbols used in the experiment */
        units: {
            digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
            letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
            symbols: ['+', '$', '%', '!', '#', '&', '@', '?', '*', '~']
        },
        /* Contains the groups and a names of the lists of units used in experiments */
        /* Properties in these arrays must be the same as keys in units objects */
        groups: {
            A: ['digits'],
            B: ['digits', 'letters'],
            C: ['digits', 'letters', 'symbols']
        },
        /* The preparation time between each trial */
        preparationTime: 2000, /* in milliseconds */
        /* How long is the pause between two symbols shown */
        symbolInBetweentime: 600, /* in milliseconds */
        /* How long the user will see a symbol */
        symbolTime: 900, /* in milliseconds */
        /* Maximum number of errors before experiment is over */
        allowedErrors: 2,
        /* The sequence length from which experiment starts */
        initialLength: 3
    };
})(window);