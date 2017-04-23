'use strict';

module.exports = function(app){
    var browserstack = require('../controllers/browserstackController');

    //browserstack api Rounts
    app.route('/browsers')
        .get(browserstack.list_all_browsers);
};