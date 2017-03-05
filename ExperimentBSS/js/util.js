(function() {
    var textEncoder = new TextEncoder('utf-8');
    var textDecoder = new TextDecoder('utf-8');

    window.sha512 = function sha512(string) {
        var buffer = textEncoder.encode(string);
        return crypto.subtle.digest('SHA-512', buffer).then(function(digestBuffer) {
            var buffer = new Uint8Array(digestBuffer), i, length;
            var s = '';
            for(i = 0, length = buffer.length; i < length; ++i) {
                s += buffer[i] < 16 ? '0' + buffer[i].toString(16) : buffer[i].toString(16);
            }
            return s;
        });
    }


    window.defer = function defer() {
        var deferred = {};
        deferred.promise = new Promise(function(resolve, reject) {
            deferred.resolve = resolve;
            deferred.reject = reject;
        });
        return deferred;
    }
})();