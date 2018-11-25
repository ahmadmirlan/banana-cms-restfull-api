const mongoose = require("mongoose");
const winston = require("winston");

module.exports = () => {
  var options = {
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
  };

  /* Database Configuration*/
  mongoose
    .connect(
      "mongodb://localhost/banana",
      options
    )
    .then(() => winston.debug("Connected to MongoDB..."));
};
