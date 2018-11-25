const createError = require('http-errors');
const express = require('express');

const app = express();

/*View Configuration*/
require('./config/view')(app);
/*General Configuration*/
require("./config/general")(app);
/*Call DB Configuration*/
require("./config/db")();
/*Call ROUTE Configuration*/
require("./routes/index")(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/*domain.on("error", function(er) {
    console.log("Oh no, something wrong with DB");
});

domain.run(function() {
    mongoose.connect(
        config.db,
        options
    );
});*/

module.exports = app;
