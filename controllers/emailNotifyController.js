// Controller for email notifications


module.exports = () => {

const bounces = (req, res) => {
  console.log('bounces subscription headers >> ', req.headers);
  console.log('bounces subscription body >> ', req.body);
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