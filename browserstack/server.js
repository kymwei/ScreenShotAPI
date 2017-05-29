var express = require('express'),
    app = express(),
    port = 300,
    bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var BrowserStack = require("browserstack");
var BrowserStackCredentials = require("./BrowserStackCredentials.js");
var screenshotClient = BrowserStack.createScreenshotClient(BrowserStackCredentials.BrowserStackCredentials());
var restClient = BrowserStack.createClient(BrowserStackCredentials.BrowserStackCredentials());

var websiteUrl = "https://www.google.com";

function SubmitJobToBrowserStack(data) {
    // data should contain the screenshot urls, the browser array, and the callback url
    // submit these details to browserstack

    /*var options = {};
    options.browsers = browsersToScreenshot;
    options.url = url;
    options.local = true;
    options.user_id = user_id;

    // use screenshot api
    //res.json(user_id + 'screen for ' + url +' is processing' + job.job_id);
    console.log("send job to browserstack for url: " + options.url);
    screenshotClient.generateScreenshots(options, function(error, job){
        if(error) {

        }else{
            res.json({
                userId: user_id,
                url: url,
                jobid: job.job_id
            })
            getScreenShot = setInterval(function() {
                    screenshotClient.getJob(job.job_id, screenShotJobCallcallback)
                }
                , 3000);
        }
    });*/
}

function getAllPlatormBrowsers(){
    var browsers = [];
    browsers.push.apply(browsers, getDesktopBrowsers());
    browsers.push.apply(browsers, getTabletBrowsers());
    browsers.push.apply(browsers, getSmartphoneBrowsers());
    return browsers;
}

function getTabletBrowsers(){
    var browsers = [];
    browsers.push(getLatest_Tablet_IOS_Browser());
    browsers.push(getLatest_Tablet_Android_Browser());
    return browsers;
}

function getLatest_Tablet_IOS_Browser() {

}

function getLatest_Tablet_Android_Browser() {

}


function getSmartphoneBrowsers(){
    var browsers = [];
    browsers.push(getLatest_Smartphone_IOS_Browser());
    browsers.push(getLatest_Smartphone_Android_Browser());
    return browsers;
}

function getLatest_Smartphone_IOS_Browser() {

}

function getLatest_Smartphone_Android_Browser() {

}

function getDesktopBrowsers(){
    var browsers = [];
    browsers.push(getLatest_Desktop_Firefox_Browser());
    browsers.push(getLatest_Desktop_Chrome_Browser());
    browsers.push(getLatest_Desktop_Edge_Browser());
    browsers.push(getLatest_Desktop_IE_Browser());
    return browsers;
}

function getLatest_Desktop_Firefox_Browser(){

}

function getLatest_Desktop_Chrome_Browser(){
/*
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
 */
}

function getLatest_Desktop_Edge_Browser(){

}

function getLatest_Desktop_IE_Browser(){

}

function getBrowsers(){
    screenshotClient.getBrowsers(function(error, browsers) {

    });
}

/// Routes ///
// this is the route to receive the job from the server, the job receiver is get only
app.route('/SubmitJob')
    .get(bodyParser.urlencoded({ extended: true }), function (req, res) {
        onsole.log('Browserstack SubmitJob');
        console.log(req.body);
        // receive url for file containing job details
        // file should have job details (urls, browser, callback url)
        // submit job to browserstack with given callback
    })

app.listen(PORT, function (err) {
    if (err) {
        return console.error('Error starting server: ', err)
    }
    console.log('Slack Server successfully started on port %s', PORT)
})
/// End Routes ///