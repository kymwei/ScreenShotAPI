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

function getTabletBrowsers(allBrowsers){
    var iosBrowsers = allBrowsers.filter(function(browser){
        return  browser.os === 'ios'
    });
    var androidBrowsers = allBrowsers.filter(function(browser){
        return  browser.os === 'android'
    });
    var browsers = [];
    browsers.push(getLatest_Tablet_IOS_Browser(iosBrowsers));
    browsers.push(getLatest_Tablet_Android_Browser());
    return browsers;
}

function getLatest_Tablet_IOS_Browser(iosBrowsers) {
    var browserList = iosBrowsers.filter(function(browser){
        return browser.device.includes('iPad');
    });

    var newList=  browserList.sort(function(a, b){
        return a.device > b.device? 1: -1;
    });
    return newList[newList.length-1]
}

function getLatest_Tablet_Android_Browser() {

}


function getSmartphoneBrowsers(allBrowsers){
    var iosBrowsers = allBrowsers.filter(function(browser){
        return  browser.os === 'ios'
    });
    var androidBrowsers = allBrowsers.filter(function(browser){
        return  browser.os === 'android'
    });


    var browsers = [];

    browsers.push(getLatest_Smartphone_IOS_Browser(iosBrowsers));
   // browsers.push(getLatest_Smartphone_Android_Browser());
    return browsers;
}


//TODO: Ray substruck plus from here
function getLatest_Smartphone_IOS_Browser(iosBrowsers) {
    var browserList = iosBrowsers.filter(function(browser){
        return browser.device.includes('iPhone');
    });

    var newList=  browserList.sort(function(a, b){
        return a.device > b.device? 1: -1;
    });
    return newList[newList.length-1]
}

function getLatest_Smartphone_Android_Browser() {

}

function getLasteVersion(desktopBrowsers, browserName){
    var browserList = desktopBrowsers.filter(function(browser){
        return browser.browser === browserName && browser !== null;
    });

    return browserList.reduce(function(newversion, current){
        return parseFloat(current.browser_version) > parseFloat(newversion.browser_version) ? current: newversion;
    });
}

function getDesktopBrowsers(allBrowsers){
    var desktopBrowsers = allBrowsers.filter(function(browser){
       return  browser.os === 'Windows'
    });
    var browsers = [];
    browsers.push(getLasteVersion(desktopBrowsers,'firefox'));
    browsers.push(getLasteVersion(desktopBrowsers,'chrome'));
    browsers.push(getLasteVersion(desktopBrowsers,'edge'));
    browsers.push(getLasteVersion(desktopBrowsers,'ie'));
    return browsers;
}

function getBrowsers(){
    screenshotClient.getBrowsers(function(error, browsers) {

    });
}
app.route('/browser')
    .get(bodyParser.urlencoded({ extended: true }), function (req, res) {
        screenshotClient.getBrowsers(function(error, browsers) {
            res.send(browsers);
        });
    })
    .post(bodyParser.urlencoded({ extended: true }), function (req, res) {

        screenshotClient.getBrowsers(function(error, browsers) {

            switch(req.body.browserType) {
                case 'desktop':
                    var desktopBrowsers = getDesktopBrowsers(browsers);
                    res.send(desktopBrowsers);
                    break;
                case 'tablet':
                    var tabletBrowsers = getTabletBrowsers(browsers);
                    res.send(tabletBrowsers);
                    break;
                case 'smartphone':
                    var smartphoneBrowsers = getSmartphoneBrowsers(browsers);
                    res.send(smartphoneBrowsers);
                    break;
                default:
                   // code block
            }



        });


        //res.send(browserType);
    })

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



app.listen(port, function (err) {
    if (err) {
        return console.error('Error starting server: ', err)
    }
    console.log('Slack Server successfully started on port %s', port)
})
/// End Routes ///