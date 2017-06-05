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
var screenshotsChannel = 'general';

var BrowserStack_SubmitJobUrl = 'http://736d28d7.ngrok.io/submitjob';

function getMessageCardAttachments(url) {
    var attachments = [
        {
            "text": "Select the platforms to get screenshots",
            "fallback": "You are unable to choose a platform",
            "callback_id": "platforms",
            "actions": [
                {
                    "name": "platform",
                    "text": "All",
                    "type": "button",
                    "value": JSON.stringify({platform:"all",url:url}),
                    "style": "primary"
                },
                {
                    "name": "platform",
                    "text": "Desktop",
                    "type": "button",
                    "value": JSON.stringify({platform:"desktop",url:url})
                },
                {
                    "name": "platform",
                    "text": "Tablet",
                    "type": "button",
                    "value": JSON.stringify({platform:"tablet",url:url})
                },
                {
                    "name": "platform",
                    "text": "Smartphone",
                    "type": "button",
                    "value": JSON.stringify({platform:"smartphone",url:url})
                },
                {
                    "name": "platform",
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

function generateCardMessage(url, channel){
    var message = {
        token: token,
        channel: channel,
        text : url
    };
    return message;
}

// handle the moo moo command from slack
function Slack_ReceiveMooMooCommand(data){
    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex = new RegExp(expression);
    var url = data.text;

    if (!url.match(regex)) {
        web.chat.postMessage(data.channel_id, 'please enter a valid URL');
    } else {
        Slack_SendMessageCard(data.text, data.channel_id);
    }
}

// sends the message card to user asking them what browsers they want to generate screenshot
function Slack_SendMessageCard(url, channel) {
    var json = generateCardMessage(url, channel);
    var attachmentData = getMessageCardAttachments(url);
    web.chat.postMessage(json.channel, json.text, {attachments: attachmentData });
}
// this function receives the response from the slack message card
function Slack_ReceiveMessageCard(data) {
    var platform = JSON.parse(data.actions[0].value).platform;
    var url = JSON.parse(data.actions[0].value).url;

    var browserStackSubmitJobUrl = BrowserStack_SubmitJobUrl + "?platform=" + platform + "&url=" + url;
    console.log('submitting job to browserstack service: ' + browserStackSubmitJobUrl);
    request({
        url: browserStackSubmitJobUrl
    }, function (error, response, body) {
        console.log('slack service: browserstack job submitted');
    })
}

function BrowserStack_JobComplete(data) {
    var callbackUrl = data.callback_url;
    // parse the platform out of the callback url, should be in the qs platform
    var queryString = callbackUrl.split('?')[1];
    console.log('queryString: ' + queryString);
    var keyValues =  queryString.split('&');
    console.log('keyValues: ' +keyValues);
    var platform = '';
    for(var i = 0; i < keyValues.length; i++) {
        if(keyValues[i].split('=')[0] == 'platform'){
            platform = keyValues[i].split('=')[1];
        }
    }

    var message = 'Screenshots for ' + data.screenshots[0].url + ' are here: ' + data.zipped_url;
    switch (platform) {
        case 'all':
            message = 'screenshots for all platforms for ' + data.screenshots[0].url + ' are here: ' + data.zipped_url;
            break;
        default:
            message = platform + ' screenshots for ' + data.screenshots[0].url + ' are here: ' + data.zipped_url;
            break;
    }
    var channel = screenshotsChannel;

    web.chat.postMessage(channel, message);
}

function GetCardResponseMessage(platform, url) {
    var message = 'screenshots submitted';
    switch(platform){
        case "all":
            message = 'Awesome, let\'s get screenshots for all platforms for ' + url + '.  Your screenshots will be posted in channel: #' + screenshotsChannel + ' :heart_eyes_cat:';
            break;
        default:
            message = 'Awesome, let\'s get ' + platform +' screenshots for ' + url + '.  Your screenshots will be posted in channel: #' + screenshotsChannel + ' :heart_eyes_cat:';
            break;
    }
    return message;
}

/// Routes ///

// slack_messageaction
//https://api.slack.com/interactive-messages#responding
app.route('/slack_messageaction')
    .post(bodyParser.urlencoded({ extended: true }), function (req, res) {
        var payload = JSON.parse(req.body.payload);
        Slack_ReceiveMessageCard(payload);
        var platform =  JSON.parse(payload.actions[0].value).platform;
        var url = JSON.parse(payload.actions[0].value).url;
        var message = GetCardResponseMessage(platform, url);
        res.send(message);
    })

// browserstack will call back to this function when it's done generating screenshots
app.route('/browserstack_jobcomplete')
    .post(bodyParser.urlencoded({ extended: true }), function (req, res) {
        BrowserStack_JobComplete(req.body);
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
