// Model
const User = require('../models/User');

// libs
const { handle } = require('../utils/errorHandler');
const { signToken } = require('../utils/token');

// outbound
const { verifyAccount } = require('../outbound/email');

module.exports = () => {
  const findByUsername = username => (
    User.findOne({ username })

    .then(user => (!user ? Promise.reject({
      statusCode: 404,
      code: 'User not found.',
    }) : Promise.resolve(user)))

    .catch(() => (
      Promise.reject({
        statusCode: 500,
        code: 'Internal server error.',
      })
    ))
  );

  const create = ({ body = {} }, res) => (
    User.createMap(body)

    .then(({ uploadAvatarUrl, createBody }) => (
      User.findOne({
        $or: [{
          username: createBody.username,
        }, {
          email: createBody.email,
        }],
      })

      .then(user => (
        user ? Promise.reject({
          statusCode: 400,
          code: 'User already exists',
        }) : User.create(createBody)

        .then(newUser => (
          verifyAccount(newUser)

          .then(() => (
            res.status(201).json(Object.assign(newUser.getInfo(), { uploadAvatarUrl }))
          ), err => (
            handle(err, res)
          ))
        ))

        .catch(() => (
          handle({
            statusCode: 500,
            code: 'Error when creating user',
          }, res)
        ))
      ), () => (
        handle({
          statusCode: 500,
          code: 'Error fetching user',
        }, res)
      ))
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  const login = ({ body = {} }, res) => (!body.username || !body.password ?
    signToken({
      timestamp: Date.now(),
    })

    .then(userToken => (
      res.json({ token: userToken })
    )) : User.login(body)

    .then(user => (
      signToken({
        username: user.username,
        timestamp: Date.now(),
        token: user.token,
      })

      .then(userToken => (
        res.json(Object.assign(user.getInfo(), { token: userToken }))
      ))
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  const retrieve = ({ params }, res) => (
    User.findOne({ username: params.username })

    .then(user => (
      (!user ? handle({
        statusCode: 404,
        code: 'User not found.',
      }, res) : res.json(user.getInfo()))
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  const update = (req, res) => (
    User.updateMap(req.body)

    .then(updateBody => (
      User.findOneAndUpdate({ username: req.params.username }, updateBody)
      .then(item => (!item ?
        handle({
          statusCode: 404,
          code: 'Not found.',
        }, res) : retrieve(req, res)
      ))
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  const deleteItem = ({ params }, res) => (
    findByUsername(params.username)

    .then(({ username }) => (
      User.remove({ username })

      .then(result => (!result ? handle({
        statusCode: 500,
        code: 'Error while deleting object.',
      }) : res.sendStatus(202)))
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  const updateAvatar = ({ user, body = {} }, res) => (
    user.updateAvatar(body.fileType)

    .then(updateInfo => (
      res.json(updateInfo)
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  return {
    create,
    retrieve,
    update,
    deleteItem,
    login,
    updateAvatar,
  };
};
