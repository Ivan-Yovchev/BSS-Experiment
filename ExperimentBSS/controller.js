var timeOut = 4000;
var digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
var symbols = ['+', '$', '%', '!', '#', '&','@', '?', '*', '~'];

$(".group_button").click(function () {
    var group = $(this).val();
    $("#text_window").hide();
    $("#button_panel").hide();
    var loader = $("<div></div>").attr("id", "container");
    $("#main_window").append(loader);

    // prepare participants for the visual stimuli
    showLoadingBar();

    // prep canvas for the upcoming visual stimuli
    setTimeout(prepCanvasForStimuli, timeOut + 100);
    
    generateRandomStringForGroup(group);
});

function showLoadingBar() {
    var bar = new ProgressBar.Circle('#container', {
        easing: 'linear',
        duration: timeOut,
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
    $("#text_window").css("font-size", "30vmax").text('H').show();
}

function generateRandomStringForGroup(group) {

}