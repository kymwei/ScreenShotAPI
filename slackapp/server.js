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

/*
This json is from the following url
 https://api.slack.com/docs/messages/builder?msg=%7B%22text%22%3A%22What%20platforms%20would%20you%20like%20to%20get%20screenshots%20for%3F%22%2C%22attachments%22%3A%5B%7B%22text%22%3A%22Platforms%22%2C%22callback_id%22%3A%22platforms%22%2C%22color%22%3A%22%233AA3E3%22%2C%22attachment_type%22%3A%22default%22%2C%22actions%22%3A%5B%7B%22name%22%3A%22All%22%2C%22text%22%3A%22All%22%2C%22type%22%3A%22button%22%2C%22value%22%3A%22all%22%7D%2C%7B%22name%22%3A%22Desktop%22%2C%22text%22%3A%22Desktop%22%2C%22type%22%3A%22button%22%2C%22value%22%3A%22desktop%22%7D%2C%7B%22name%22%3A%22Tablet%22%2C%22text%22%3A%22Tablet%22%2C%22type%22%3A%22button%22%2C%22value%22%3A%22tablet%22%7D%2C%7B%22name%22%3A%22Smartphone%22%2C%22text%22%3A%22Smartphone%22%2C%22type%22%3A%22button%22%2C%22value%22%3A%22smartphone%22%7D%5D%7D%5D%7D
 */
function getMessageCardJson() {
    var card = new Object();
    card.text = "What platforms would you like to get screenshots for?";
    card.attachments = getMessageCardAttachments();

    return JSON.stringify(card);
}

function getMessageCardAttachments() {
    var attachments = new Object();
    attachments.title = "Platforms";
    attachments.fallback = 'platforms'
    attachments.callback_id = "platforms";
    attachments.attachment_type = "default";

    var allAction = new Object();
    allAction.name =  "All";
    allAction.text  = "All";
    allAction.type = "button";
    allAction.value = "all";

    var desktopAction = new Object();
    desktopAction.name =  "Desktop";
    desktopAction.text  = "Desktop";
    desktopAction.type = "button";
    allAction.value = "desktop";

    var tabletAction = new Object();
    tabletAction.name =  "Tablet";
    tabletAction.text  = "Tablet";
    tabletAction.type = "button";
    tabletAction.value = "tablet";

    var smartphoneAction = new Object();
    smartphoneAction.name =  "Smartphone";
    smartphoneAction.text  = "Smartphone";
    smartphoneAction.type = "button";
    smartphoneAction.value = "smartphone";

    attachments.actions = [];
    attachments.actions.push(allAction);
    attachments.actions.push(desktopAction);
    attachments.actions.push(tabletAction);
    attachments.actions.push(smartphoneAction);

    return attachments;
}

/* save working attachments

 [{"fallback":"Platforms","text":"Platforms","callback_id":"platforms","actions":[{"name":"platform","text":"All","type":"button","value":"all"},{"name":"platform","text":"Desktop","type":"button","value":"desktop"},{"name":"platform","text":"Tablet","type":"button","value":"tablet"},{"name":"platform","text":"Smartphone","type":"button","value":"smartphone"}]}]
 */

function generateCardMessage(){
    var message = {
        token: token,
        channel: "general",
        attachments: JSON.stringify(getMessageCardAttachments()),
        text: "What platforms would you like to get screenshots for?"
    };
    return message;
}

// receive command from slack app, cmd is cmd parameters in json format
function Slack_ReceiveMooMooCommand(data){
    console.log('MooMoo Command Received From Slack');
    console.log('Sending Card Message');
    console.log(JSON.stringify(generateCardMessage()));
    console.log('Card Message Sent');
    // we got a /moomoo command, save the urls and the command origin for reference
    web.chat
    // and send the user a card asking for which platforms to test
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
// slack_messageoptions
app.route('/slack_messageoptions')
    .post(bodyParser.urlencoded({ extended: true }), function (req, res) {
        console.log('slack_messageoptions');
        console.log(req.body);

        menu_options = {
            "options": [
                {
                    "text": "Chess",
                    "value": "chess"
                },
                {
                    "text": "Global Thermonuclear War",
                    "value": "war"
                }
            ]
        }

        res.json(menu_options);
    })

// slack_messageaction
app.route('/slack_messageaction')
    .post(bodyParser.urlencoded({ extended: true }), function (req, res) {
        console.log('slack_messageaction');
        console.log(req.body);
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
        //if (req.body.token !== VERIFY_TOKEN) {
        //return res.sendStatus(401)
        //}
        // else

        Slack_ReceiveMooMooCommand(req.body);
        res.end();



        /*
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
         */
    })

app.listen(port, function (err) {
    if (err) {
        return console.error('Error starting server: ', err)
    }
    console.log('Slack Server successfully started on port %s', port)
})
/// End Routes ///
