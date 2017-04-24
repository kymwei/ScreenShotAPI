var express = require('express');
var bodyParser = require('body-parser')
var http = require('http');
var app = express();
var PORT = 1234

var browserStackGenerateScreenShotEndPoint = 'http://chefmoomoo.com:1002/generateScreenShot'
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

        var requestData = {
            "url": url,
            "username": user
        }

        // QPX REST API URL (I censored my api key)
        url = "https://www.googleapis.com/qpxExpress/v1/trips/search?key=myApiKey"

        // fire request
        request({
            url: browserStackGenerateScreenShotEndPoint,
            json: true,
            multipart: {
                chunked: false,
                data: [
                    {
                        'content-type': 'application/json',
                        body: requestData
                    }
                ]
            }
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log(body)
            }
            else {

                console.log("error: " + error)
                console.log("response.statusCode: " + response.statusCode)
                console.log("response.statusText: " + response.statusText)
            }
        })
    })

app.listen(PORT, function (er) {
    if (err) {
        return console.error('Error starting server: ', err)
    }

    console.log('Server successfully started on port %s', PORT)
})