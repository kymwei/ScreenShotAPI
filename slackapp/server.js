var express = require('express'),
    app = express(),
    port = 1234,
    bodyParser = require('body-parser'),
    querystring = require('querystring'),
    request = require('request');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Slack Related Configuration
var slackToken = require("./SlackCredentials.js");
var token = slackToken.SlackCredentials.token;
var WebClient = require('@slack/client').WebClient;
var web = new WebClient(token);
var screenshotsChannel = '#moomoo-screenshots';
var attachments = require("./Attachments.js");

//var BrowserStack_SubmitJobUrl = 'http://www.chefmoomoo.com:300/submitjob';
var BrowserStack_SubmitJobUrl = 'http://localhost:300/submitjob';

function validateUrl(url) {
    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex = new RegExp(expression);
    if (!url.match(regex)) {
        return true;
    } else {
        return false;
    }
}

// handle the moo moo command from slack
function Slack_ReceiveMooMooCommand(data){
    var url = data.text;
    if (validateUrl(url)) {
        return "Please enter a valid URL";
    } else {
        Slack_SendMessageCard(data);
    }
}

// sends the message card to user asking them what browsers they want to generate screenshot
function Slack_SendMessageCard(data) {
    // setup post
    var options = {
        url: data.response_url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        json: {
            response_type: "ephemeral",
            attachments: attachments.cards.platformAttachments(data.text, data.user_name, data.user_id)
        }
    }

    console.log(options.json.attachments[0].actions);

    // send card
    request(options, function (error, response, body) {

    })
}
// this function receives the response from the slack message card
function Slack_ReceiveMessageCard(action) {
    var actionJson = JSON.parse(action.value);
    console.log(actionJson);
    var browserStackSubmitJobUrl = BrowserStack_SubmitJobUrl + "?platform=" + actionJson.platform + "&user=" + actionJson.user + "&userid=" + actionJson.user_id + "&url=" + encodeURIComponent(actionJson.url);
    console.log('submitting job to browserstack service: ' + browserStackSubmitJobUrl);

    request({
        url: browserStackSubmitJobUrl
    }, function (error, response, body) {
        console.log('slack service: browserstack job submitted', error);
    })
}

function BrowserStack_JobComplete(data) {
    console.log('browserstack job complete received')
    console.log(data);
    var callbackUrl = data.callback_url;
    // parse the platform out of the callback url, should be in the qs platform
    var queryString = callbackUrl.split('?')[1];
    var keyValues =  queryString.split('&');
    var platform = '';
    var user = '';
    var userId = '';
    for(var i = 0; i < keyValues.length; i++) {

        var keyValue = keyValues[i].split('=');
        switch(keyValue[0]){

            case 'platform':
                platform = keyValue[1];
                break;
            case 'user':
                user = keyValue[1];
                break;
            case 'userid':
                userId = keyValue[1];
                break;
        }

    }
    var url = decodeURIComponent(data.screenshots[0].url);
    var message = 'Screenshots for ' + url + ' are here: ' + data.zipped_url;
    switch (platform) {
        case 'all':
            message = '<@' + userId + '|' + user + '> screenshots for all platforms for \n' + url + '\n zip file are here: ' + data.zipped_url;
            break;
        default:
            message = '<@' + userId + '|' + user + '> ' + platform + ' screenshots for \n' + url + '\n are here: ' + data.zipped_url;
            break;
    }
    var channel = screenshotsChannel;

    web.chat.postMessage(channel, message);
    //TODO: list time out device
    //TODO: ask user if want to display more
    //web.chat.postMessage(channel, '', {attachments: attachments.cards.dislpaySreenShot('test') });
}

function GetCardResponseMessage(platform, url) {
    var message = 'screenshots submitted';
    switch(platform){
        case "all":
            message = 'Getting screenshots for all platforms for \n' + decodeURIComponent(url) + '\n' + GetRandomCatMessage();
            break;
        default:
            message = 'Getting ' + platform + ' screenshots for \n' + decodeURIComponent(url) + '\n' + GetRandomCatMessage();
            break;
    }
    return message;
}

function GetRandomCatMessage() {
        var msgs = [];
        msgs.push('Your screenshots will be posted in ' + screenshotsChannel + ' in a meow-ment.');
        msgs.push('Please wait a meow-ment, your screenshots will be posted in ' + screenshotsChannel + '.');
        msgs.push('Your screenshots will be posted in ' + screenshotsChannel + ' purr-ty soon.');
        msgs.push('Head over to ' + screenshotsChannel + ' for your :paw_prints:-some screenshots.');
        msgs.push("We're cooking up your screenshots right meow.  Head over to " + screenshotsChannel);

        var index =  Math.floor(Math.random() * msgs.length);
        console.log(index);

        return(msgs[index]);
}

/// Routes ///

// slack_messageaction
app.route('/slack_messageaction')
    .post(bodyParser.urlencoded({ extended: true }), function (req, res) {
        //TODO: use secure payload.token to verify it from slack
        if(req.body.payload) {
            var payload = JSON.parse(req.body.payload);
            switch (payload.callback_id){
                case 'platforms':

                    if(payload.actions[0].value.length > 0){

                        Slack_ReceiveMessageCard(payload.actions[0]);
                        var card = JSON.parse(payload.actions[0].value);
                        var platform =  card.platform;
                        var url = card.url;
                        var message = GetCardResponseMessage(platform, url);
                        res.send(message);
                    }else{
                        res.send(' ');
                    }


                    break
                case 'displayScreenShot':
                    // Slack_ReceiveMessageCard(payload);
                    // var platform =  JSON.parse(payload.actions[0].value).platform;
                    // var url = JSON.parse(payload.actions[0].value).url;
                    // var message = GetCardResponseMessage(platform, url);
                    // res.send(message);
                    break
                default:
                    res.send(' ');

            }
        }
    })

// browserstack will call back to this function when it's done generating screenshots
app.route('/browserstack_jobcomplete')
    .post(bodyParser.urlencoded({ extended: true }), function (req, res) {
        BrowserStack_JobComplete(req.body);
    })

app.route('/browserstack_jobcomplete_dev')
    .post(bodyParser.urlencoded({ extended: true }), function (req, res) {
        BrowserStack_JobComplete(req.body);
    })

// Slack moomoo command receiver
app.route('/slack_moomoo')
    .get(function (req, res) {
        res.sendStatus(200)
    })
    .post(bodyParser.urlencoded({ extended: true }), function (req, res) {
        var msg = Slack_ReceiveMooMooCommand(req.body);
        if(msg && msg.length > 0){
            res.send(msg);
        }
        else{
            res.end();
        }

    })
/// End Routes ///

app.listen(port, function (err) {
    if (err) {
        return console.error('Error starting server: ', err)
    }
    console.log('Slack Server successfully started on port %s', port)
})
