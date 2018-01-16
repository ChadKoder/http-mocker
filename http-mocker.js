var express = require('express');
var https = require('https');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');
var port = process.argv[2];

if (!port) {
	port = 8282;
}

app.use(bodyParser.json());

app.post('/api/createmockget/', function(req, res) {
    var removeIndex = null;
    var endpoint = req.body.endpoint;
    var responseData = req.body.data;
    var dataCount = req.body.recordcount;
    var route, routes = []; 
    var endpoint = req.body.endpoint.toLowerCase();
    console.log('POST /createmockget/ called to create endpoint: ' + endpoint);

    //TODO: Delete specific HTTP method if it exists(get, put, etc..), not just endpoint name.
    app._router.stack.forEach(function(middleware, index){
        if(middleware.route){ // routes registered directly on the app
            if (middleware.route.path.toLowerCase().includes(endpoint)) {
                removeIndex = index;
            routes.push(middleware.route);
            } /*else if(middleware.name === 'router'){ // router middleware 						
            middleware.handle.stack.forEach(function(handler){
                route = handler.route;
                console.log('adding route: ' + route);
                route && routes.push(route);						
            });*/
        }
    });

    if (removeIndex) {
        app._router.stack.splice(removeIndex, 1);
        console.log('Route deleted: ' + endpoint);
    }
    
    app.get('/api' + endpoint.toString().trim(), function(req, res) {			
        if (dataCount) {
			res.set({
				'access-control-expose-headers': 'x-total-record-count',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Credentials': 'true',
				'x-total-record-count': dataCount
			});
		}

		res.writeHead(200, {'Content-Type': 'application/json'});		
		res.end(JSON.stringify(responseData));
    });			
   
    res.writeHead(200, {'Content-Type': 'application/json'});		
    res.end(JSON.stringify('Mock endpoint created: ' + endpoint));
});

app.listen(port);

console.log('*** Running http-mocker service on port ' + port);
