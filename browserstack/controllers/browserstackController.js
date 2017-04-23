'use strict'

var BrowserStack = require("browserstack");
var Credentials = require("../credentials.js");
var screenshotClient = BrowserStack.createScreenshotClient(Credentials.browserStackCredentials());
var slackToken = require("../slack.js");
var token = process.env.SLACK_API_TOKEN || slackToken.slack.token; //see section above on sensitive data
var WebClient = require('@slack/client').WebClient;
var web = new WebClient(token);

exports.list_all_browsers = function(req, res){
    var data = {'res':'hi cutie pie'};
    screenshotClient.getBrowsers(function(error, browsers) {

        res.json(browsers);

    });

};

exports.getScreenShot = function(req, res){
    var user_id = req.body.username;
    var url = req.body.url;

    screenshotClient.getBrowsers(function(error, browsers) {
        var latestChromeBrowser = GetWindows7LatestChromeBrowser(browsers);
        var browsersToScreenshot = [];
        browsersToScreenshot.push(latestChromeBrowser);

        var options = {};
        options.browsers = browsersToScreenshot;
        options.url = url;
        options.local = true;

        // use screenshot api
        console.log(options);
        screenshotClient.generateScreenshots(options, generateScreenshotsCallback);
        res.json(user_id + 'screen for ' + url +' is processing');

    });

};


function screenShotJobCallcallback(error, job) {

    if(error) {
        console.log(error.stack);
    }else{
        debugger
        if(job.screenshots[0].image_url) {
            web.chat.postMessage('#general', job.screenshots[0].image_url, function (err, res) {
                if (err) {
                    console.log('Error:', err);
                } else {
                    console.log(count);
                    console.log('Message sent: ', res);

                }
            });
            clearInterval(getScreenShot);

        }
        console.log(job);
    }
}

var getScreenShot;
var count = 0;
function generateScreenshotsCallback(error, job) {
    debugger
    if(error) {
        console.log(error.stack);
    }else{

        getScreenShot = setInterval(function() {
                screenshotClient.getJob(job.job_id, screenShotJobCallcallback)
                count ++;
            }
            , 3000);
    }
}

function GetWindows7LatestChromeBrowser(browsers){
    // filter chrome browsers

    var chromeBrowsers = browsers.filter(function (el) {
        return el.browser == 'chrome',
        el.os_version == '7'}
    );

    var highestVersion = 0.0;
    for(var i = 0; i < chromeBrowsers.length - 1; i++) {
        var version = chromeBrowsers[i].browser_version;
        if(!isNaN(version)) {
            if(parseFloat(version) > highestVersion) {
                highestVersion = parseFloat(version);
            }
        }
    }

    var latestBrowser = chromeBrowsers.filter(function (el) {
        return el.browser_version == highestVersion}
    )[0];

    return(latestBrowser);
}