'use strict'

var BrowserStack = require("browserstack");
var Credentials = require("../credentials.js");
var screenshotClient = BrowserStack.createScreenshotClient(Credentials.browserStackCredentials());


var request = require('request');

var SlackApiBrowserstackScreenshotCompleteEndPoint = 'http://www.chefmoomoo.com:1234/BrowserstackScreenshotComplete'

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
        var iosBrowser = {"os":"ios","os_version":"8.3","browser":"Mobile Safari","device":"iPhone 6 Plus","browser_version":null};
        var browsersToScreenshot = [];
        browsersToScreenshot.push(latestChromeBrowser);
        browsersToScreenshot.push(iosBrowser);

        var options = {};
        options.browsers = browsersToScreenshot;
        options.url = url;
        options.local = true;
        options.user_id = user_id;

        // use screenshot api
        //res.json(user_id + 'screen for ' + url +' is processing' + job.job_id);
        screenshotClient.generateScreenshots(options, function(error, job){
            console.log("get request from slack app")
            if(error) {

            }else{
                res.json({
                    userId: user_id,
                    url: url,
                    jobid: job.job_id
                })
                getScreenShot = setInterval(function() {
                        screenshotClient.getJob(job.job_id, screenShotJobCallcallback)
                        count ++;
                    }
                    , 3000);
            }
        });



    });

};

var SlackScreenShotEndPoint = 'http://localhost:1234/BrowserstackScreenshotComplete';
function screenShotJobCallcallback(error, job) {
    console.log('polling for image' + new Date().getTime());
    if(error) {
        console.log(error.stack);
    }else{

        var allImageReady = false;
        for( var i = 0; i<job.screenshots.length ; i ++){
            allImageReady = job.screenshots[i].image_url === null ? false : true;
        }

        if(allImageReady) {
            console.log('image found');

            request.post(
                SlackApiBrowserstackScreenshotCompleteEndPoint,
                {form:{screenshot:job}},
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        res.send('from screenShotJobCallcallback message sent');
                    }
                }
            );
            clearInterval(getScreenShot);

        }
       // console.log(job);
    }
}

var getScreenShot;
var count = 0;
function generateScreenshotsCallback(error, job ) {

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

function GetiosBrowser(browsers){
    // filter chrome browsers

    var chromeBrowsers = browsers.filter(function (el) {
        return el.browser == 'Mobile Safari',
        el.os_version == '8.3'}
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