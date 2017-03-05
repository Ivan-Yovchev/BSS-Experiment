(function() {
    var namespace = window.bssExperiment = window.bssExperiment || {};

    namespace.onError = function(error) {
        console.error(error);
        bssExperiment.showErrorMessage(error.message || error + '');
        throw error;
    }
})();