// Model
const User = require('../models/User');

module.exports = () => {

  const bounces = (req, res) => {
    const message = JSON.parse(JSON.parse(req.body).Message);
    const emailAddress = message.bounce.bouncedRecipients[0].emailAddress.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    if (!(/ransient/g.test(message.bounce.bounceType)) && emailAddress && emailAddress.length) {
      console.log('finding and removing hard bounce to: ', emailAddress[0]);
      return User.findOneAndUpdate({email: emailAddress[0]}, {email: undefined, search: [emailAddress[0]]})

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
    const message = JSON.parse(JSON.parse(req.body).Message);
    const emailAddress = message.complaint.complainedRecipients[0].emailAddress.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    if (emailAddress && emailAddress.length) {
      console.log('finding and removing complaint to: ', emailAddress[0]);
      return User.findOneAndUpdate({email: emailAddress[0]}, {email: undefined, search: [emailAddress[0]]})

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

  return {
    bounces,
    complaints
  };
};