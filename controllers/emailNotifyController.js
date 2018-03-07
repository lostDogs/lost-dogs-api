// Model
const User = require('../models/User');


module.exports = () => {

const bounces = (req, res) => {
  const message = JSON.parse(JSON.parse(req.body).Message);
  const emailAddress = message.bounce.bouncedRecipients[0].emailAddress.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
  if (emailAddress && emailAddress.length) {
    console.log('finding and updating', emailAddress[0]);
    return User.findOneAndUpdate({email: emailAddress[0]}, {email: undefined})

    .then(() => (
      res.status(200).json()
    ))
    
    .catch(() => (
      Promise.reject({
        statusCode: 500,
        code: 'Internal server error.',
      })      
    ))
  } 
  };

const complaints = (req, res) => {
  console.log('complaints subscription headers >> ', req.headers);
  console.log('bounces subscription body >> ', req.body);
  return res.status(200).json();
  };

  return {
    bounces,
    complaints
  };
};