var express = require('express'),
    app = express(),
    port = 1234,
    bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var request = require('request');
var slackToken = require("./SlackCredentials.js");
var token = slackToken.SlackCredentials.token;
var WebClient = require('@slack/client').WebClient;
var web = new WebClient(token);

var BroserStack_SubmitJob = 'http://www.chefmoomoo.com:300/SubmitJob'
var BrowserStack_JobComplete = 'http://www.chefmoomoo.com:1234/BrowserStack_JobComplete'

// receive command from slack app, cmd is cmd parameters in json format
function Slack_ReceiveMooMooCommand(cmd){
    // we got a /moomoo command, save the urls and the command origin for reference
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
// browserstack will call back to this function when it's done generating screenshots
app.route('/Browserstack_JobComplete')
    .get(function (req, res) {
        res.sendStatus(200)
    })
    .post(bodyParser.urlencoded({ extended: true }), function (req, res) {
        console.log('Browserstack Job Complete');
        console.log(req.body);
        // post the screenshot urls back to the channel
    })

// Slack moomoo command receiver
app.route('/Slack_MooMoo')
    .get(function (req, res) {
        res.sendStatus(200)
    })
    .post(bodyParser.urlencoded({ extended: true }), function (req, res) {
        console.log('MooMoo Command Received From Slack');
        console.log(req.body);
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

app.listen(PORT, function (err) {
    if (err) {
        return console.error('Error starting server: ', err)
    }
    console.log('Slack Server successfully started on port %s', PORT)
})
/// End Routes ///
