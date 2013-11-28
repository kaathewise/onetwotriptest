var express = require('express')
    , Clerk = require('./clerk')
    , client = require('./client');

var app = express()
    , clerk = Clerk();

app.enable('trust proxy');

app.get('/search', function(req, res){
    res.send(clerk.addTask(
        client.request.bind(null, req.query),
        600000
    ));
});

app.get('/result', function(req, res){
    res.send(clerk.getStatus(req.query.sid));
});

app.listen(8124);
