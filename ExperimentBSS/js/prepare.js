(function() {
    var namespace = window.bssExperiment = window.bssExperiment || {};

    namespace.statePrepare = function(time) {
        if(typeof time !== 'number' || !isFinite(time) || time < 0) {
            return Promise.reject(new Error('Invalid amount of waiting time specified: expected positive integer'));
        }
        var bar = $('#prepare').data('bar');
        if(!bar) {
            bar = new ProgressBar.Circle(barElement, {
                easing: 'linear',
                color: '#3498db',
                trailColor: '#d3d3d3',
                strokeWidth: 6,
                trailWidth: 1
            });
            $('#prepare').data('bar', bar);
        }
        $('body>*').hide();
        $('body').addClass();
        bar.animate(1, {
            duration: time
        });
    };
})();