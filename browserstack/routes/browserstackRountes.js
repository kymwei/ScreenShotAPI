'use strict';

module.exports = function(app){
    var browserstack = require('../controllers/browserstackController');

    app.get('/', function (req, res) {
        res.send('hi cutie pie')
    })

    //browserstack api Rounts
    app.route('/browsers')
        .get(browserstack.list_all_browsers);

    app.route('/generateScreenShot')
        .get(function (req, res) {
            console.log(req);
            res.send('Get a random book')
        })
        .post(browserstack.getScreenShot)
        .put(function (req, res) {
            res.send('Update the book')
        })
};


