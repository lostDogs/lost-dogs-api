// Model
const User = require('../models/User');

// libs
const { handle } = require('../lib/errorHandler');
const { signToken } = require('../lib/token');

// outbound
const { verifyAccount, forgotPasswordEmail } = require('../outbound/email');
const { verifyCaptcha } = require('../outbound/captcha');

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
            signToken({
              username: newUser.username,
              timestamp: Date.now(),
              token: newUser.token,
            })
          ))

          .then(userToken => (
            res.status(201).json(Object.assign(newUser.getInfo(), { uploadAvatarUrl, token: userToken }))
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

  const retrieve = ({ params: { username } }, res) => (
    User.findOne({ username })

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

  const update = ({ body, params: { username } }, res) => (
    User.updateMap(body)

    .then(updateBody => (
      User.findOneAndUpdate({ username }, updateBody)
      .then(item => (!item ?
        handle({
          statusCode: 404,
          code: 'Not found.',
        }, res) : retrieve({ params: { username } }, res)
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

  const getPaymentOptions = ({ user }, res) => (
    user.paymentOptions()

    .then(paymentOptions => (
      res.json(paymentOptions)
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  const getBankAccounts = ({ user }, res) => (
    user.bankAccounts()

    .then(bankAccounts => (
      res.json(bankAccounts)
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  const createPaymentOption = ({ user, body }, res) => (
    user.addPaymentOption(body)

    .then(cardResult => (
      res.json(cardResult)
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  const createBankAccount = ({ user, body }, res) => (
    user.addBankAccount(body)

    .then(bankAccount => (
      res.json(bankAccount)
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

  const forgotPassword = ({ params: { username } }, res) => (
    User.findByUsername(username)

    .then(user => (
      !user ? Promise.reject({
        statusCode: 404,
        code: 'Not found.',
      }) :user.generateNewPassword()

      .then(password => (
        forgotPasswordEmail({ user, password })
      ))
    ))

    .then(() => (
      res.json({
        success: true,
      })
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  const changePassword = ({ user, body: { new_password: newPassword, confirm_password: confirmPassword, old_password: oldPassword } }, res) => (
    user.replacePassword({ newPassword, confirmPassword, oldPassword })

    .then(() => (
      res.json({
        success: true,
      })
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  const capchaValid = ({body}, res) => (
    verifyCaptcha(body.captchaVal).then(response => (
      res.status(201).json(response)
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
    getPaymentOptions,
    createPaymentOption,
    createBankAccount,
    getBankAccounts,
    forgotPassword,
    changePassword,
    capchaValid
  };
};
