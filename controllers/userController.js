// Model
const User = require('../models/User');

// libs
const ErrorHander = require('../utils/errorHandler');
const token = require('../utils/token');

module.exports = () => {
  const findByUsername = username => (
    new Promise((resolve, reject) => {
      User.findOne({ username }, (err, user) => {
        if (err) {
          return reject({
            statusCode: 500,
            code: 'Internal server error.',
          });
        } if (!user) {
          return reject({
            statusCode: 404,
            code: 'User not found.',
          });
        }

        return resolve(user);
      });
    })
  );

  const create = (req, res) => {
    User.createMap(req.body)

    .then(({ avatar, createBody }) => {
      User.findOne({
        $or: [{
          username: createBody.username,
        }, {
          email: createBody.email,
        }],
      }, (err, user) => {
        if (err) {
          return ErrorHander.handle({
            statusCode: 500,
            code: 'Error fetching user',
          }, res);
        }

        if (user) {
          return ErrorHander.handle({
            statusCode: 400,
            code: 'User already exists',
          }, res);
        }

        return User.create(createBody, (createErr, newUser) => {
          if (createErr) {
            return ErrorHander.handle({
              statusCode: 500,
              code: 'Error when creating user',
            }, res);
          }

          return res.status(201).json(Object.assign(newUser.getInfo(), { avatar }));
        });
      });
    })

    .catch(err => (
      ErrorHander.handle(err, res)
    ));
  };

  const login = (req, res) => {
    const body = req.body || {};

    if (!body.username || !body.password) {
      return token.signToken({
        timestamp: Date.now(),
      })

      .then(userToken => (
        res.json({ token: userToken })
      ));
    }

    return User.login(req.body)

      .then(user => (
        token.signToken({
          username: user.username,
          timestamp: Date.now(),
          token: user.token,
        })

        .then(userToken => (
          res.json(Object.assign(user.getInfo(), { token: userToken }))
        ))
      ))

      .catch(err => (
        ErrorHander.handle(err, res)
      ));
  };

  const retrieve = (req, res) => {
    User.findOne({
      username: req.params.username,
    }, (err, user) => {
      if (err) {
        return ErrorHander.handle(err, res);
      } if (!user) {
        return ErrorHander.handle({
          statusCode: 404,
          code: 'User not found.',
        }, res);
      }

      return res.json(user.getInfo());
    });
  };

  const update = (req, res) => {
    User.updateMap(req.body)

    .then(updateBody => (
      User.findOneAndUpdate({ username: req.params.username }, updateBody, (err, item) => {
        if (err) {
          return ErrorHander.handle({
            statusCode: 500,
            code: 'Error while updating object.',
          }, res);
        } else if (!item) {
          return ErrorHander.handle({
            statusCode: 404,
            code: 'Not found.',
          }, res);
        }

        return retrieve(req, res);
      })
    ), err => (
      ErrorHander.handle(err, res)
    ));
  };

  const deleteItem = (req, res) => {
    findByUsername(req.params.username)

    .then((user) => {
      User.remove({ username: user.username }, (deleteError, result) => {
        if (deleteError || !result) {
          return ErrorHander.handle({
            statusCode: 500,
            code: 'Error while deleting object.',
          });
        }

        return res.sendStatus(202);
      });
    }, err => (
      ErrorHander.handle(err, res)
    ));
  };

  return {
    create,
    retrieve,
    update,
    deleteItem,
    login,
  };
};
