// Controller for email notifications


module.exports = () => {

const bounces = (req, res) => {
  console.log('bounces subscription headers >> ', req.headers);
  console.log('bounces subscription body >> ', req.body);
  console.log('<<<<<<< end bounce subscription body  >>>>>> ',);
  const message = JSON.parse(JSON.parse(req.body).Message);
  console.log('bounces  message >> ', message);
  console.log('bounces  emailAddress >> ', message.bounce.bouncedRecipients[0].emailAddress);
  return res.status(200).json();
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