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
var attachments = require("./Attachments.js");

//var BrowserStack_SubmitJobUrl = 'http://www.chefmoomoo.com:300/submitjob';
var BrowserStack_SubmitJobUrl = 'http://localhost:300/submitjob';


function generateCardMessage(url, channel){
    var message = {
        token: token,
        channel: channel,
        text : decodeURIComponent(url)
    };
    return message;
}

// handle the moo moo command from slack
function Slack_ReceiveMooMooCommand(data){
    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex = new RegExp(expression);
    var url = data.text;
    console.log('a' + data.channel_id)
    if (!url.match(regex)) {
        web.chat.postMessage(data.channel_id, 'please enter a valid URL');
    } else {
        Slack_SendMessageCard((data.text), data.channel_id);
    }
}

// sends the message card to user asking them what browsers they want to generate screenshot
function Slack_SendMessageCard(url, channel) {
    var json = generateCardMessage(url, channel);
    console.log(channel)
    var attachmentData = attachments.cards.platformAttachments(url);
    web.chat.postMessage(json.channel, json.text, {attachments: attachmentData });
}
// this function receives the response from the slack message card
function Slack_ReceiveMessageCard(action) {
    var actionJson = JSON.parse(action.value);

    //var url = JSON.parse(action.value).url;

    var browserStackSubmitJobUrl = BrowserStack_SubmitJobUrl + "?platform=" + actionJson.platform + "&url=" + encodeURIComponent(actionJson.url);
    console.log('submitting job to browserstack service: ' + browserStackSubmitJobUrl);

    // request({
    //     url: browserStackSubmitJobUrl
    // }, function (error, response, body) {
    //     console.log('slack service: browserstack job submitted', error);
    // })
}

function BrowserStack_JobComplete(data) {
    console.log(data);
    var callbackUrl = data.callback_url;
    // parse the platform out of the callback url, should be in the qs platform
    var queryString = callbackUrl.split('?')[1];
    //console.log('queryString: ' + queryString);
    var keyValues =  queryString.split('&');
    //console.log('keyValues: ' +keyValues);
    var platform = '';
    for(var i = 0; i < keyValues.length; i++) {
        if(keyValues[i].split('=')[0] == 'platform'){
            platform = keyValues[i].split('=')[1];
        }
    }
    var url = decodeURIComponent(data.screenshots[0].url);
    var message = 'Screenshots for ' + url + ' are here: ' + data.zipped_url;
    switch (platform) {
        case 'all':
            message = 'screenshots for all platforms for ' + url + ' are here: ' + data.zipped_url;
            break;
        default:
            message = platform + ' screenshots for ' + url + ' are here: ' + data.zipped_url;
            break;
    }
    var channel = screenshotsChannel;

    web.chat.postMessage(channel, message);
   // web.chat.postMessage(channel, json.text, {attachments: attachmentData });
}

function GetCardResponseMessage(platform, url) {
    var message = 'screenshots submitted';
    switch(platform){
        case "all":
            message = 'Getting screenshots for all platforms for ' + decodeURIComponent(url) + '. ' + GetRandomCatMessage();
            break;
        default:
            message = 'Getting ' + platform + ' screenshots for ' + decodeURIComponent(url) + '. ' + GetRandomCatMessage();
            break;
    }
    return message;
}

function GetRandomCatMessage() {
        var msgs = [];
        msgs.push('Your screenshots will be posted in #' + screenshotsChannel + ' in a :smiley_cat:-ment.');
        msgs.push('Please wait a :smiley_cat:-ment, your screenshots will be posted in #' + screenshotsChannel + '.');
        msgs.push('Your screenshots will be posted in #' + screenshotsChannel + ' :dog:-ty soon.');
        msgs.push('Head over to #' + screenshotsChannel + ' for your :paw_prints: -some screenshots.');

        var index =  Math.floor(Math.random() * msgs.length);
        console.log(index);

        return(msgs[index]);
}

/// Routes ///

// slack_messageaction
//https://api.slack.com/interactive-messages#responding
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
                        res.send('MooMoo is a :cow:');
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
                    res.send('MooMoo is a :cow:');

            }
        }


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
