var express = require('express'),
    app = express(),
    port = 1234,
    bodyParser = require('body-parser'),
    querystring = require('querystring'),
    http = require("https");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var request = require('request');
var slackToken = require("./SlackCredentials.js");
var token = slackToken.SlackCredentials.token;
var WebClient = require('@slack/client').WebClient;
var web = new WebClient(token);

var BroserStack_SubmitJob = 'http://www.chefmoomoo.com:300/SubmitJob';
var BrowserStack_JobComplete = 'http://www.chefmoomoo.com:1234/BrowserStack_JobComplete';

function getMessageCardAttachments(url) {
    var attachments = [
        {
            "text": "Select the platforms to get screenshots",
            "fallback": "You are unable to choose a platform",
            "callback_id": "platforms",
            "actions": [
                {
                    "name": "All",
                    "text": "All",
                    "type": "button",
                    "value": JSON.stringify({platform:"all",url:url}),
                    "style": "primary"
                },
                {
                    "name": "Desktop",
                    "text": "Desktop",
                    "type": "button",
                    "value": JSON.stringify({platform:"desktop",url:url})
                },
                {
                    "name": "Tablet",
                    "text": "Tablet",
                    "type": "button",
                    "value": JSON.stringify({platform:"tablet",url:url})
                },
                {
                    "name": "Smartphone",
                    "text": "Smartphone",
                    "type": "button",
                    "value": JSON.stringify({platform:"smartphone",url:url})
                },
                {
                    "name": "Cancel",
                    "text": "Cancel",
                    "type": "button",
                    "value": JSON.stringify({platform:"none",url:url}),
                    "style": "danger"
                }
            ]
        }
    ]

    return attachments;
}

function generateCardMessage(){
    var message = {
        token: token,
        channel: "general",
        text : ' '
    };
    return message;
}

// receive command from slack app, cmd is cmd parameters in json format
//https://api.slack.com/docs/message-guidelines

function Slack_ReceiveMooMooCommand(data){
    console.log(data);
    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex = new RegExp(expression);
    var url = data.text;

    if (!url.match(regex)) {
        web.chat.postMessage(data.channel_id, 'please enter a valid URL');
    } else {
        console.log('MooMoo Command Received From Slack');
        console.log('Sending Card Message');
        console.log('Card Message Sent');
        var json = generateCardMessage();
        var attachmentData = getMessageCardAttachments(data.text);

        // we got a /moomoo command, save the urls and the command origin for reference
        web.chat.postMessage(json.channel, json.text, {attachments: attachmentData });
        // and send the user a card asking for which platforms to test
    }
}

// sends the message card to user asking them what browsers they want to generate screenshot in
function Slack_SendMessageCard(user) {
    // ask user what they want the screenshots in.
    // options are: "Desktop, Smartphone, Tablet, All"
}

// this function receives the response from the slack message card
function Slack_ReceiveMessageCard(platform) {
    // submit the listed urls to browserstack with the specified platforms
    // desktop, smartphone, tablet, or all
    // use BrowserStack_JobComplete as a callback url

}

/// Routes ///

// slack_messageaction
//https://api.slack.com/interactive-messages#responding
app.route('/slack_messageaction')
    .get(function (req, res) {
        res.sendStatus(200)
    })
    .post(bodyParser.urlencoded({ extended: true }), function (req, res) {
        console.log('slack_messageaction');
        var playload = JSON.parse(req.body.payload);
        console.log(playload);
        res.send('Awesome, let\'s test ' + playload.actions[0].name +' for '+ JSON.parse(playload.actions[0].value).url + ' :heart_eyes_cat:')
    })

// browserstack will call back to this function when it's done generating screenshots
app.route('/browserstack_jobcomplete')
    .get(function (req, res) {
        res.sendStatus(200)
    })
    .post(bodyParser.urlencoded({ extended: true }), function (req, res) {
        console.log('Browserstack Job Complete');
        console.log(req.body);
        // post the screenshot urls back to the channel
    })

// Slack moomoo command receiver
app.route('/slack_moomoo')
    .get(function (req, res) {
        res.sendStatus(200)
    })
    .post(bodyParser.urlencoded({ extended: true }), function (req, res) {
        Slack_ReceiveMooMooCommand(req.body);
        res.end();
    })

app.listen(port, function (err) {
    if (err) {
        return console.error('Error starting server: ', err)
    }
    console.log('Slack Server successfully started on port %s', port)
})
/// End Routes ///
