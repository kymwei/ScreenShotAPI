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

var BrowserStack_JobCompleteUrl = 'http://bc073371.ngrok.io/browserstack_jobcomplete';
var url = '';
var platform = '';

var websiteUrl = "https://www.google.com";

function ExtractUrlAndPlatformFromQS(qs){
    var splitQS = qs.split('&');
    for(var i = 0; i < splitQS.length; i++){
        var keyValue = splitQS[i].split('=');
        switch(keyValue[0]){
            case 'url':
                url = keyValue[1];
                break;
            case 'platform':
                platform = keyValue[1];
                break;
        }
    }
    if(url == '' || platform == '') {
        return false;
    }
    return true;
}

function SubmitJobToBrowserStack(qs) {
    if(!ExtractUrlAndPlatformFromQS(qs)) {
        return false;
    }
    else {
        screenshotClient.getBrowsers(getBrowsers_callback);
        return true;
    }
    return false;
}

function getBrowsers_callback(error, browsers) {
    console.log('get browsers');
    var browsersToScreenshot;
    switch (platform) {
        case 'desktop':
            browsersToScreenshot = getDesktopBrowsers(browsers);
            break;
        case 'tablet':
            browsersToScreenshot = getTabletBrowsers(browsers);
            break;
        case 'smartphone':
            browsersToScreenshot = getSmartphoneBrowsers(browsers);
            break;
        case 'all':
            browsersToScreenshot = getAllPlatormBrowsers(browsers);
            break;
    }
    if (!browsersToScreenshot) {
        console.log('no browsers to screenshot');
        return false;
    }
    else {
        console.log('browsers found');

        var options = {};
        options.browsers = browsersToScreenshot;
        options.url = url;
        options.local = true;
        options.callback_url = BrowserStack_JobCompleteUrl;

        screenshotClient.generateScreenshots(options, function (error, job) {
            if (error) {
                
            } else {

            }
        });

        return true;
    }
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

function getLatest_Smartphone_IOS_Browser(iosBrowsers) {
    var browserList = iosBrowsers.filter(function(browser){
        return browser.device.includes('iPhone');
    });

    var newList = browserList.sort(function(a, b){
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
// this is the route to receive the job from the slack app, the job receiver is get only
app.route('/submitjob')
    .get(bodyParser.urlencoded({ extended: true }), function (req, res) {
        console.log('job received');
        if(SubmitJobToBrowserStack(req._parsedUrl.query)) {
            console.log('submit job is ok');
            res.sendStatus(200);
        }
        else {
            console.log('submit job is bad');
            res.sendStatus(500);
        }

    })

app.listen(port, function (err) {
    if (err) {
        return console.error('Error starting server: ', err)
    }
    console.log('BrowserStack Server successfully started on port %s', port)
})
/// End Routes ///