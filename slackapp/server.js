var express = require('express');
var bodyParser = require('body-parser')
var request = require('request');
var app = express();
var PORT = 1234;
var messageQueue = [];
var slackToken = require("./slackCredentials.js");
var token = process.env.SLACK_API_TOKEN || slackToken.slack.token;
var WebClient = require('@slack/client').WebClient;
var web = new WebClient(token);

var browserStackGenerateScreenShotEndPoint = 'http://www.chefmoomoo.com:300/generatescreenshot'

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
        request.post(
            browserStackGenerateScreenShotEndPoint,
            { json: { url: url, username: user, timestamp: new Date().getTime() } },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                }
            }
        );
    })

app.route('/TriggerMessage')
    .get(function (req, res) {
        console.log('trigger message');
        request.post(
            browserStackGenerateScreenShotEndPoint,
            { json: { url: 'google.com', username: 'raytam', timestamp: new Date().getTime() } },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body)
                    res.send('message sent');
                }
            }
        );

    })

app.route('/BrowserstackScreenshotComplete')
    .get(function (req, res) {
        res.sendStatus(200)
    })
    .post(bodyParser.urlencoded({ extended: true }), function (req, res) {
        console.log('Browserstack Screenshot Complete');
        console.log(req.body);

        for(var i = 0; i < req.body.screenshot.screenshots.length; i++) {
            ssObj = req.body.screenshot.screenshots[i];
            var msg = ssObj.image_url + ' ' + ssObj.url + ' ' + ssObj.os + ' ' + ssObj.os_version + ': ' + ssObj.browser;

            addMessageToQueue('#general', msg);
        }
        ProcessMessageQueue();
    })

function addMessageToQueue(channel, message){
    var msg = {};
    msg.channel = channel;
    msg.message = message;
    messageQueue.push(msg);
}

function ProcessMessageQueue(){
    if(messageQueue.length > 0) {
        console.log('posting message to slack');
        var msg = messageQueue.shift();
        web.chat.postMessage(msg.channel, msg.message, PostMessageToSlackCallback);
    }
}

function PostMessageToSlackCallback(err, res){
    if (err) {
        console.log('Error:', err);
    } else {
        console.log('posted message to slack');
        console.log('Message sent: ', res);
        if(messageQueue.length > 0) {
            console.log('### Message Queue length ' + messageQueue.length);
            ProcessMessageQueue();
        }

    }
}




app.listen(PORT, function (err) {
    if (err) {
        return console.error('Error starting server: ', err)
    }

    console.log('Server successfully started on port %s', PORT)
})