// dependencies
const jwt = require('jsonwebtoken');

// models
const User = require('../models/User');

const validateToken = (token, username) => {
  if (!token) {
    return Promise.reject({
      statusCode: 401,
      code: 'No token found.',
    });
  }

  if (!/token [\S]*/.test(token)) {
    return Promise.reject({
      statusCode: 400,
      code: 'Malformed token.',
    });
  }

  return new Promise((resolve, reject) => (
      jwt.verify(token.split(' ')[1], process.env.SESSION_SECRET, { algorithms: ['HS384'] }, (verifyError, jwtPayload) => {
        if (verifyError) {
          return reject({
            statusCode: 401,
            code: 'Not a valid token.',
          });
        }

        if (!jwtPayload.username) {
          return resolve(jwtPayload);
        }

        if (username && jwtPayload.username !== username) {
          return reject({
            statusCode: 401,
            code: 'Username doesn\'t match with token',
          });
        }

        return resolve(jwtPayload);
      })
    ))

    .then(jwtPayload => (
      User.validateToken(jwtPayload)

      .then(user => (
        Promise.resolve({
          user,
          jwtPayload,
        })
      ))
    ));
};

module.exports.signToken = jwtPayload => (
  new Promise((resolve, reject) => {
    jwt.sign(jwtPayload, process.env.SESSION_SECRET, { algorithm: 'HS384' }, (err, token) => {
      if (err) {
        return reject({
          statusCode: 500,
          code: 'Error signing token.',
        });
      }

      return resolve(token);
    });
  })
);

module.exports.middleware = (req, res, next) => {
  const token = req.headers.Authorization || req.headers.authorization;

  validateToken(token, req.params[0].replace('/', ''))

    .then((authInfo) => {
      req.user = authInfo.user;
      req.jwtPayload = authInfo.jwtPayload;

      next();
    }, err => (
      res.status(err.statusCode).json(err)
    ));
};
