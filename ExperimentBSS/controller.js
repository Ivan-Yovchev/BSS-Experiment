var loadingTime = 4000;
var timeOut = 750;

var stimulusLength = 3;
var digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
var symbols = ['+', '$', '%', '!', '#', '&', '@', '?', '*', '~'];

var timer = 0;

$(".group_button").click(function () {
    var group = $(this).val();
    $("#text_window").hide();
    $("#button_panel").hide();
    var loader = $("<div></div>").attr("id", "container");
    $("#main_window").append(loader);

    // prepare participants for the visual stimuli
    showLoadingBar();

    // generate visual stimuli per group
    var stimuli = generateRandomStringForGroup(group);
    console.log(stimuli);

    // prep canvas for the upcoming visual stimuli
    setTimeout(prepCanvasForStimuli, loadingTime);
    setTimeout(showVisualStimuli, loadingTime, stimuli);
});

function showLoadingBar() {
    var bar = new ProgressBar.Circle('#container', {
        easing: 'linear',
        duration: loadingTime,
        color: '#3498db',
        trailColor: '#d3d3d3',
        strokeWidth: 6,
        trailWidth: 1,
        text: {
            autoStyleContainer: false
        },
        from: { color: '#3498db', width: 6 },
        to: { color: '#3498db', width: 6 },
        // Set default step function for all animate calls
        step: function (state, circle) {
            circle.path.setAttribute('stroke', state.color);
            circle.path.setAttribute('stroke-width', state.width);

            var value = Math.round(circle.value() * 100);
            if (value === 0) {
                circle.setText('');
            } else {
                circle.setText(value);
            }

        }
    });
    bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
    bar.animate(1);
}

function prepCanvasForStimuli() {
    $("#container").hide();
}

function showVisualStimuli(string) {
    var textwindow = $("#text_window");
    textwindow.css("font-size", "30vmax").text(' ').show();

    for (var i = 0; i < 2 * string.length; i++) {
        presentSymbol(textwindow, string, i);
    }
}

function presentSymbol(window, string, i) {
    setTimeout(function () {
        if (timer % 2 == 0) {
            window.text(string[parseInt(timer/2)]);
        }
        else {

            window.text(' ');
        }

        timer++;
    }, (i + 1) * timeOut);
}

function generateRandomStringForGroup(group) {
    var generatedRandomString;
    if (group == 1) {
        // Randomize only digits
        generatedRandomString = generateRandomDigits();
    }
    else if (group == 2) {
        // Randomize digits and letters
        generatedRandomString = generateRandomDigitsAndLetters();
    }
    else if (group == 3) {
        // Randomize digits, letters and symbols
        generatedRandomString = generateRandomDigitsLettersAndSymbols();
    }

    return generatedRandomString;
}

function generateRandomDigits() {
    var string = [];
    var index = 0;
    for (var i = 0; i < stimulusLength; i++) {
        index = getRandomInt(0, digits.length - 1);
        string.push(digits[index]);
    }

    return string;
}

function generateRandomDigitsAndLetters() {
    var string = [];
    var index = 0;

    // determine number of blocks of stimuli needed
    // digits and letters come in bloks of two [digit, letter] or [letter, digit]
    var numberOfBlocks = stimulusLength / 2;
    if (stimulusLength % 2 != 0) {
        numberOfBlocks--;
    }

    for (var i = 0; i < numberOfBlocks; i++) {
        var selectTypeOfStimulus = getRandomInt(0, 1);

        // if selectTypeOfStimulus is zero,
        // first we add a digit then a letter
        // otherwise - the reverse
        if (selectTypeOfStimulus == 0) {
            // add digit first
            index = getRandomInt(0, digits.length - 1);
            string.push(digits[index]);

            // followed by letter
            index = getRandomInt(0, letters.length - 1);
            string.push(letters[index]);
        }
        else {
            // else do the reverse
            index = getRandomInt(0, letters.length - 1);
            string.push(letters[index]);
            index = getRandomInt(0, digits.length - 1);
            string.push(digits[index]);
        }
    }

    // since stimuli are added in blocks of two
    // if the stimulus length is odd add one more
    // symbol to the string
    if (stimulusLength % 2 != 0) {
        var selectTypeOfStimulus = getRandomInt(0, 1);
        if (selectTypeOfStimulus == 0) {
            index = getRandomInt(0, digits.length - 1);
            string.push(digits[index]);
        }
        else {
            index = getRandomInt(0, letters.length - 1);
            string.push(letters[index]);
        }
    }

    return string;
}

function generateRandomDigitsLettersAndSymbols() {
    var string = [];
    var index = 0, type1 = 0, type2 = 0, type3 = 0;

    // determine number of blocks of stimuli needed
    // digits, letters and symbols come in bloks of three
    // [digit, letter, symbol] or [digit, symbol, letter] or
    // [letter, digit, symbol] or [letter, symbol, digit] or
    // [symbol, letter, digit] or [symbol, digit, letter] or
    var numberOfBlocks = stimulusLength / 3;
    if (stimulusLength % 3 != 0) {
        numberOfBlocks--;
    }

    for (var i = 0; i < numberOfBlocks; i++) {
        // select first type of visual stimuli
        type1 = getRandomInt(0, 2);

        // select second type of visual stimuli different from the first
        do {
            type2 = getRandomInt(0, 2);
        } while (type2 === type1);

        // third type of visual stimuli is the one left
        type3 = 3 - type1 - type2;

        // assign values
        assignValue(type1, string);
        assignValue(type2, string);
        assignValue(type3, string);
    }

    // two more to add if number is even and not divisable by 3
    if (stimulusLength % 3 == 2) {
        type1 = getRandomInt(0, 2);

        // select second type of visual stimuli different from the first
        do {
            type2 = getRandomInt(0, 2);
        } while (type2 === type1);

        assignValue(type1, string);
        assignValue(type2, string);
    }
    // if not divisable by 3 only one more to add
    else if (stimulusLength % 3 == 1) {
        type1 = getRandomInt(0, 2);
        assignValue(type1, string);
    }

    return string;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function assignValue(n, string){
    switch (n) {
        case 0: index = getRandomInt(0, digits.length - 1);
            string.push(digits[index]); break;
        case 1: index = getRandomInt(0, letters.length - 1);
            string.push(letters[index]); break;
        case 2: index = getRandomInt(0, symbols.length - 1);
            string.push(symbols[index]); break;
    }
}