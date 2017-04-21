var BrowserStack = require("browserstack");
var Credentials = require("./credentials.js");

var screenshotClient = BrowserStack.createScreenshotClient(Credentials.browserStackCredentials());
var restclient = BrowserStack.createClient(Credentials.browserStackCredentials());
var websiteUrl = "https://test01.dev.kbb.com";

var WebClient = require('@slack/client').WebClient;

var token = process.env.SLACK_API_TOKEN || 'xoxp-173151743030-172346769218-172422642532-454b7a0b1fcd4fa270a55681746ac10e'; //see section above on sensitive data

var web = new WebClient(token);


screenshotClient.getBrowsers(function(error, browsers) {
	var latestChromeBrowser = GetWindows7LatestChromeBrowser(browsers);
	var browsersToScreenshot = [];
	browsersToScreenshot.push(latestChromeBrowser);

	var options = {};
	options.browsers = browsersToScreenshot;
    options.url = websiteUrl;

	// use screenshot api

	//screenshotClient.generateScreenshots(options, generateScreenshotsCallback);


	// use rest api workers
	//restclient.createWorker(latestChromeBrowser, createWorkerCallback);

	//get job back 3ab6173996ed7bdb3c9ae4af882ae0ff38506a7c
    screenshotClient.getJob("3ab6173996ed7bdb3c9ae4af882ae0ff38506a7c", screenShotJobCallcallback)
});


function screenShotJobCallcallback(error, job) {

    if(error) {
        console.log(error.stack);
    }else{
        web.chat.postMessage('#general', job.screenshots[0].image_url, function(err, res) {
            if (err) {
                console.log('Error:', err);
            } else {
                console.log('Message sent: ', res);
            }
        });
    	console.log(job);
	}
}

function createWorkerCallback(error, worker) {
	if(error) {
		console.log(error.stack);
	}
}

function generateScreenshotsCallback(error, job) {
	debugger
	if(error) {
		console.log(error.stack);
	}else{

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