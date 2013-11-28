var events = require('events');

module.exports.Requester = Requester;

data1 = [
{
    dest: 'MSQ',
    flight: 'B2 954',
    carrier: 'Belavia',
    time: '6:40 AM',
    time_act: '6:35 AM',
    gate: '54'
},
{
    dest: 'VIE',
    flight: 'HG 8111',
    carrier: 'Niki',
    time: '5:55 AM',
    time_act: '6:00 AM'
}
];

data2 = [
{
    dest: 'ROV',
    flight: 'IB 7263',
    carrier: 'Iberia',
    time: '12:25 AM',
    time_act: '1:15 AM',
    gate: '51'
},
{
    dest: 'KUF',
    flight: 'IB 7295',
    carrier: 'Iberia',
    time: '12:25 AM',
    time_act: '1:08 AM',
    gate: '34'
}
];

function Requester(opts) {
    var self = this instanceof Requester
        ? this
        : Object.create(Requester.prototype);

    events.EventEmitter.call(self);

    if (opts.port == 'ERR') {
        setTimeout(function() {
            self.emit('error', 'Request error');
        }, 15000);
    } else {
        setTimeout(function() {
            self.emit('success', {
                request: opts,
                response: opts.carrier ? data2 : data1 
            });
        }, 15000);
    }
    return self;
}

Requester.prototype = Object.create(events.EventEmitter.prototype);
