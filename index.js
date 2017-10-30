const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');
const dotenv = require('dotenv');

// load environment options
if (process.env.ENVIRONMENT !== 'production') {
  dotenv.load({ path: '.env' });
}

const app = express();
mongoose.Promise = Promise;

// middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// routers
const dogs = require('./routes/dogRoute');
const users = require('./routes/userRoute');

/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGOLAB_URI || `${process.env.MONGODB_PORT_27017_TCP_ADDR}/lostdogs`);
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');

  app.set('port', process.env.PORT || 3000);
  app.use(logger(process.env.ENVIRONMENT));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(cors());

  app.use('/api/dogs', dogs);
  app.use('/api/users', users);

  /**
   * Start Express server.
   */
  app.listen(app.get('port'), () => {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
  });
});
