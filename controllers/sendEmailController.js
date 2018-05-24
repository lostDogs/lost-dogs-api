// libs
const { endAdEmail } = require('../outbound/email');


module.exports = () => {

  const startEmail = ({body, user }, res) => (
    Promise.reject({ statusCode: 401 ,code: 'This acount is not an Admin'})
  );

  const endEmail = ({body, user }, res) => {
   endAdEmail(body)
   
   .then(() => ( res.status(201).json({ success: true }) ))

  .catch((e) => {console.error('error in seding email controller', e)});
  }

  return {
    startEmail,
    endEmail
  }

};
