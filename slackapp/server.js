var express = require('express');
var bodyParser = require('body-parser')
var request = require('request');
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

        var options={
            'url': url,
            'username': user
        };

        request({
                url:browserStackGenerateScreenShotEndPoint,
                method:"POST",
                json:true},function(error,response,body){
                console.log(body)
            }
        );
    })

app.listen(PORT, function (er) {
    if (err) {
        return console.error('Error starting server: ', err)
    }

    console.log('Server successfully started on port %s', PORT)
})