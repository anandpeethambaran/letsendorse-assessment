const mongoose = require('mongoose');
const config = require('config')
const logger = require('./logger')

module.exports = (app) => {
  mongoose.connect(
    config.mongodb
  ).catch(err => {
    logger.error(JSON.stringify(err));
    process.exit(1);
  });

  app.set('mongooseClient', mongoose);
};
