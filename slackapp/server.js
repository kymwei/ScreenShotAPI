var express = require('express');
var bodyParser = require('body-parser')
var request = require('request');
var app = express();
var PORT = 1234

var browserStackGenerateScreenShotEndPoint = 'http://10.228.150.7:300/generatescreenshot'

app.route('/BrowserstackScreenshotComplete')
    .get(function (req, res) {
        res.sendStatus(200)
    })
    .post(bodyParser.urlencoded({ extended: true }), function (req, res) {

    })


app.route('/SlackEndPoint')
    .get(function (req, res) {
        res.sendStatus(200)
    })
    .post(bodyParser.urlencoded({ extended: true }), function (req, res) {
        //if (req.body.token !== VERIFY_TOKEN) {
            //return res.sendStatus(401)
        //}

        var url = req.body.text;
        var user = req.body.user_name;
        var message = 'Requested by ' + user + '.  Generating screenshots for: ' + url;

        console.log(req.body);

        res.json({
            response_type: 'in_channel',
            text: message
        })

        // post to browserStackGenerateScreenShotEndPoint
        // url=www.yahoo.com
        // username=raytam
        request.post(
            browserStackGenerateScreenShotEndPoint,
            { json: { url: url, username: user } },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body)
                }
            }
        );
    })

app.listen(PORT, function (err) {
    if (err) {
        return console.error('Error starting server: ', err)
    }

    console.log('Server successfully started on port %s', PORT)
})