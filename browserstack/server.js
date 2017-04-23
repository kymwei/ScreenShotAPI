var express = require('express'),
    app = express(),
    port = process.env.PORT || 300,
    bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./routes/browserstackRountes');
routes(app);

app.listen(port);

console.log('RESTful API server started on: ' + port);
