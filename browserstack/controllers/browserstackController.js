'use strict'

var BrowserStack = require("browserstack");
var Credentials = require("../credentials.js");
var screenshotClient = BrowserStack.createScreenshotClient(Credentials.browserStackCredentials());

exports.list_all_browsers = function(req, res){
    var data = {'res':'hi cutie pie'};
    screenshotClient.getBrowsers(function(error, browsers) {

        res.json(browsers);

    });

};
