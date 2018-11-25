const path = require('path');

module.exports = (app) => {
    // view engine setup
    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'pug');
};