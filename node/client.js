var request = require('request')
    , async = require('async');

var HOUR = 3600 * 1000
    , key = 'appId=8326d077&appKey=fa39576f0e412565065cd06b73d0e6b3';

module.exports.request = function (opts, callback) {
    var now = +(new Date())
        , st
        , et
        , nt
        , urls;

    if (opts.carrier) {
        st = now - 12 * HOUR;
        et = now + 12 * HOUR;
    } else {
        st = now - 4 * HOUR;
        et = now + 4 * HOUR;
    }

    urls = [];
    while (st < et) {
        nt = Math.min(st + 6 * HOUR, et);
        urls.push(makeUrl(opts, st, ~~((nt - st) / HOUR) ));
        st = nt;
    }

    async.parallel(
        urls.map(function (url) { console.log(url); return request.bind(null, url); }),
        processResults
    );

    function processResults (err, results) {
        if (results) {
            results = results.map( function (result) {
                try {
                    return JSON.parse(result[1]);
                } catch (e) {
                    return null;
                }
            });
        }
        callback(err, results);
    }
}

function makeUrl (opts, st, hours) {
    var st = new Date(st)
        , url = "https://api.flightstats.com/flex/flightstatus/rest/v2/json/airport/status/";
    url += opts.port + '/' + opts.type + '/' + st.getUTCFullYear() + '/' + (st.getUTCMonth() + 1) + '/' + st.getUTCDate() + '/' + st.getUTCHours();
    url += '?utc=true&numHours=' + hours + '&' + key;
    if (opts.carrier) {
        url += '&carrier=' + opts.carrier;
    }
    return url;
}
