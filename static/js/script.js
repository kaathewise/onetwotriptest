$(function() {
    var srv = '/srv'
        , $search = $('#search')
        , $port = $('#port')
        , $type = $('#type')
        , $carrier = $('#carrier')
        , $form = $('#form')
        , $alertarea = $('#alert-container')
        , $resultarea = $('#result-container')
        , params
        , ports = {}
        , carriers = {};

    window.onpopstate = popstate;

    $search.on('click', search);

    function popstate(e) {
        params = getQuery();
        $port.val(params.port || '');
        $type.val(params.type);
        $carrier.val(params.carrier);
        if (params.sid) {
            getResult();
        } else {
            search();
        }
    }

    function search() {
        params = {
            port: $port.val(),
            type: $type.val(),
            carrier: $carrier.val()
        };
        if (!params.port) {
            return;
        }
        stateWait();
        getSid();
    }

    function getSid() {
        $.ajax({
            url: srv + '/search/',
            data: params,
        })
        .success(receiveSid)
        .error(error); 
    }

    function receiveSid(data) {
        params.sid = data.sid
        window.history.pushState({}, '', '?' + makeQuery(params));
        getResult();
    }

    function getResult() {
        stateWait();
        $.ajax({
            url: srv + '/result/',
            data: { sid: params.sid }
        })
        .success(receiveResult)
        .error(error);
    }

    function receiveResult(data) {
        if (data.error) {

            // Bad sid

            getSid();
        } else if (!data.task) {
            // Bad response
        } else if (data.task.executing) {

            // Please wait

            setTimeout(getResult, 2000);
        } else if (data.task.error) {

            // Task error

        } else if (data.task.result) {
            var flights;
            
            flights = $.map(data.task.result, function (chunk) {
                var airlines = reach(chunk, 'appendix.airlines')
                    , airports = reach(chunk, 'appendix.airports');
            
                if (airlines) {
                    airlines.forEach(function (airline) {
                        carriers[airline.fs] = airline.name;
                    });
                }
                if (airports) {
                    airports.forEach(function (airport) {
                        ports[airport.fs] = airport.fs + ' ' + (airport.city || '');
                    });
                }
                
                return chunk.flightStatuses;
            });


            buildResult(flights, params.type, params.carrier);
            stateResult();

        } else {
            // Bad response
        }
    }

    function stateWait() {
        $form.prop('disabled', true);
        showMessage('Please wait, your request is being processed...');
    }

    function stateResult() {
        $form.prop('disabled', false);
        $alertarea.html('');
    }

    function stateError() {
        $form.prop('disabled', false);
        showMessage('Error processing request', 'error');
    }
        
    function showMessage(message, type) {
        var mType = type || 'info';
        $alertarea.html('<div class="alert alert-' + mType + '">' + message + '</div>');
    }

    function buildResult(result, type, carrier) {
        var headers = carrier
                ? ['Date', 'Destination',  'Flight', 'Schedule (Actual)', 'Gate', 'Status']
                : ['Destination',  'Flight', 'Airline', 'Schedule (Actual)', 'Gate', 'Status']
            , $table, $header, $body ;

        $header = $('<tr>');
        headers.forEach(function (header) { $header.append('<th>' + header + '</th>'); });
        $table = $('<table>', {class: "table"}).append($('<thead>').append($header));
        $body = $('<tbody>');

        result = $.map(result, function (flight) { return processFlight(flight, type); });
        result.sort(multiPropCmp('fullTime', 'id', 'cshare'));

        result.forEach(function (flight) {
            var $tr;

            $tr = $('<tr>', { class: (flight.cshare ? 'warning' : '') });
            (
                carrier
                ? ['date', 'dest', 'number', 'time', 'gate', 'status']
                : ['dest', 'number', 'carrier', 'time', 'gate', 'status']
            ).forEach(function (field) {
                $tr.append($('<td>', { html: (flight[field] || '') }));
            });

            $body.append($tr);
        });
        
        $resultarea.html($table.append($body));

        console.log(result);
    }

    function processFlight(flight, type) {
        var dest, gate, time, fullTime, actual, date, result;
        if (type == 'dep') {
            dest = flight.arrivalAirportFsCode;
            fullTime = reach(flight, 'operationalTimes.scheduledGateDeparture.dateLocal');
            actual = reach(flight, 'operationalTimes.actualGateDeparture.dateLocal');
            gate = reach(flight, 'airportResources.departureGate');
        } else {
            dest = flight.departureAirportFsCode;
            fullTime = reach(flight, 'operationalTimes.scheduledGateArrival.dateLocal');
            actual = reach(flight, 'operationalTimes.actualGateArrival.dateLocal');
            gate = reach(flight, 'airportResources.arrivalGate');
        }
        time = fullTime && fullTime.substring(11, 16);
        date = fullTime && fullTime.substring(5, 10);
        actual = actual && actual.substring(11, 16);
        result = [{
            id: flight.flightId,
            date: date,
            dest: ports[dest] || dest,
            number: flight.carrierFsCode + ' ' + flight.flightNumber,
            carrier: carriers[flight.carrierFsCode] || flight.carrierFsCode,
            time: time + (actual ? ' (' + actual + ')' : ''),
            cshare: false,
            gate: gate,
            status: flight.status,
            fullTime: fullTime
        }];
        
        if (flight.codeshares) {
            flight.codeshares.forEach(function (codeshare) {
                result.push($.extend({}, result[0], {
                    number: codeshare.fsCode + ' ' + codeshare.flightNumber + ' ^',
                    carrier: carriers[codeshare.fsCode] || codeshare.fsCode,
                    cshare: true
                }));
            });
        }
        return result;
    }


        
    function error(e, data) {


    }
});
