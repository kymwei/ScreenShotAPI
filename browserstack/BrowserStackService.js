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

var BrowserStack_JobCompleteUrl = 'http://www.chefmoomoo.com:1234/browserstack_jobcomplete';
var url = '';
var platform = '';

const browserstackcmd = require('commander');



var websiteUrl = "https://www.google.com";

// function ExtractUrlAndPlatformFromQS(qs){
//     var splitQS = qs.split('&');
//     for(var i = 0; i < splitQS.length; i++){
//         var keyValue = splitQS[i].split('=');
//         switch(keyValue[0]){
//             case 'url':
//                 url = keyValue[1];
//                 break;
//             case 'platform':
//                 platform = keyValue[1];
//                 break;
//         }
//     }
//     if(url == '' || platform == '') {
//         return false;
//     }
//     return true;
// }

function SubmitJobToBrowserStack(qs) {
    if(browserstackcmd.url) {
        url = decodeURIComponent(browserstackcmd.url);
        platform = browserstackcmd.platform || 'all';
        screenshotClient.getBrowsers(getBrowsers_callback);
    }else{
        return false
    }




}

function getBrowsers_callback(error, browsers) {
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

        var options = {};
        options.browsers = browsersToScreenshot;
        options.url = url;
        options.local = true;
        options.callback_url = BrowserStack_JobCompleteUrl + '?platform=' + platform;

        screenshotClient.generateScreenshots(options, function (error, job) {
            if (error) {

            } else {

            }
        });

        return true;
    }
}
/// Routes ///
// gets a JSON of available browsers
app.route('/browsers')
    .get(bodyParser.urlencoded({ extended: true }), function (req, res) {
        screenshotClient.getBrowsers(function(error, browsers) {
            res.send(browsers);
        });
    })



// app.listen(port, function (err) {
//     if (err) {
//         return console.error('Error starting server: ', err)
//     }
//     console.log('BrowserStack Server successfully started on port %s', port)
// })
/// End Routes ///

/* *** HANDLE BROWSER STUFF *** */

function getAllPlatormBrowsers(allBrowsers){
    var browsers = [];
    browsers.push.apply(browsers, getDesktopBrowsers(allBrowsers));
    browsers.push.apply(browsers, getTabletBrowsers(allBrowsers));
    browsers.push.apply(browsers, getSmartphoneBrowsers(allBrowsers));
    return browsers;
}

function getTabletBrowsers(allBrowsers){
    var browsers = [];
    browsers.push(getLatest_Tablet_IOS_Browser(allBrowsers));
    browsers.push(getLatest_Tablet_Android_Browser(allBrowsers));
    return browsers;
}

function getLatest_Tablet_IOS_Browser(allBrowsers) {
    // filter for iPad but exclude iPad Minis and iPad Airs
    var tabletIosBrowsers = allBrowsers.filter(function(browser){
        return browser.device != null && browser.device.indexOf('iPad') > -1 && browser.device.indexOf('Mini') == -1  && browser.device.indexOf('Air') == -1
    });

    // sort by device, this will hopefully get us the latest ipad release at the end of the array
    tabletIosBrowsers.sort(sortByDeviceAlphabetically);
    return(tabletIosBrowsers[tabletIosBrowsers.length - 1]);
}

function getLatest_Tablet_Android_Browser(allBrowsers) {
    // filter for Samsung Galaxy Tab
    var tabletAndroidBrowsers = allBrowsers.filter(function(browser){
        return browser.device != null && browser.device.indexOf('Samsung Galaxy Tab') > -1
    });

    // sort by device, this will hopefully get us the latest samsung galaxy tab release at the end of the array
    tabletAndroidBrowsers.sort(sortByDeviceAlphabetically);
    return(tabletAndroidBrowsers[tabletAndroidBrowsers.length - 1]);
}

function getSmartphoneBrowsers(allBrowsers){
    var browsers = [];
    browsers.push(getLatest_Smartphone_IOS_Browser(allBrowsers));
    browsers.push(getLatest_Smartphone_Android_Browser(allBrowsers));
    return browsers;
}

function getLatest_Smartphone_IOS_Browser(allBrowsers) {
    // filter for iPhone but exclude iPhone Plus
    var smartPhoneIosBrowsers = allBrowsers.filter(function(browser){
        return browser.device != null && browser.device.indexOf('iPhone') > -1 && browser.device.indexOf('Plus') == -1
    });

    // sort by device, this will hopefully get us the latest iPhone release at the end of the array
    smartPhoneIosBrowsers.sort(sortByDeviceAlphabetically);
    return(smartPhoneIosBrowsers[smartPhoneIosBrowsers.length - 1]);
}

function getLatest_Smartphone_Android_Browser(allBrowsers) {
    // filter for Samsung Galaxy but exclude Samsung Galaxy Tab and Mini and Note
    var smartPhoneAndroidBrowsers = allBrowsers.filter(function(browser){
        return browser.device != null && browser.device.indexOf('Samsung Galaxy') > -1
            && browser.device.indexOf('Tab') == -1 && browser.device.indexOf('Mini') == -1 && browser.device.indexOf('Note') == -1
    });

    // sort by device, this will hopefully get us the latest Samsung Galaxy release at the end of the array
    smartPhoneAndroidBrowsers.sort(sortByDeviceAlphabetically);
    return(smartPhoneAndroidBrowsers[smartPhoneAndroidBrowsers.length - 1]);
}

function getLastestVersion(browsers, browserName){
    var browserList = browsers.filter(function(browser){
        return browser.browser === browserName && browser !== null;
    });

    return browserList.reduce(function(newVersion, current){
        return parseFloat(current.browser_version) > parseFloat(newVersion.browser_version) ? current: newVersion;
    });
}

function getDesktopBrowsers(allBrowsers){
    var desktopBrowsers = allBrowsers.filter(function(browser){
        return browser.os === 'Windows'
    });
    var browsers = [];
    browsers.push(getLastestVersion(desktopBrowsers,'firefox'));
    browsers.push(getLastestVersion(desktopBrowsers,'chrome'));
    browsers.push(getLastestVersion(desktopBrowsers,'edge'));
    browsers.push(getLastestVersion(desktopBrowsers,'ie'));
    return browsers;
}

/* *** HELPERS *** */

function sortByDeviceAlphabetically(a,b) {
    if (a.device < b.device)
        return -1;
    if (a.device > b.device)
        return 1;
    return 0;
}

/* *** END HELPERS *** */

/* *** END BROWSER STUFF *** */


browserstackcmd
    .version('0.0.1')
    .option('-u, --url <url>', 'screenshot URL')
    .option('-p, --platform [string]', 'desktop, smartphone, tablet, all')
    .option('-s, --slacksUser [string]', 'slack user name')
    .option('-v, --view [string]', 'zip, imgurl')
    .parse(process.argv)

console.log(browserstackcmd.url);

if (browserstackcmd.url) {
    SubmitJobToBrowserStack()
}else {
    console.error('no command given!');
    process.exit(1);

}


