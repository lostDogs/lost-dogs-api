// models
const CrudManager = require('./crudManager');
const Transaction = require('../models/Transaction');

// libs
const { handle } = require('../lib/errorHandler');

module.exports = () => {
  const crudManager = CrudManager(Transaction);

  const retrieve = (req, res) => (
    crudManager.retrieve(req.params.id)

      .then(transaction => (
        res.status(200).json(transaction)
      ))

      .catch(err => (
        handle(err, res)
      ))
  );

  const pay = ({ user, body, params: { id } }, res) => (
    Transaction.findById(id)

    .then(transaction => (
      !transaction ? Promise.reject({
        statusCode: 404,
        code: 'Not found.',
      }) : transaction.pay({ user, body })

      .then(paymentResult => (
        res.json({
          transaction: transaction.getInfo(),
          paymentResult,
        })
      ))
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  const reward = ({ user, params: { id, identifier }, body }, res) => (
    Transaction.findById(id)

    .then(transaction => (
      !transaction ? Promise.reject({
        statusCode: 404,
        code: 'Not found.',
      }) : !transaction.paymentId ? Promise.reject({
        statusCode: 400,
        code: 'Payment not registered.',
      }) : transaction.qrIdentifier !== identifier ? Promise.reject({
        statusCode: 400,
        code: 'Identifier does not match',
      }) : user.username !== transaction.found_id ? Promise.reject({
        statusCode: 400,
        code: 'User does not match',
      }) : transaction.reward({ user, body })
    ))

    .then(paymentResult => (
      res.json(paymentResult)
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  const deleteItem = (req, res) => (
    crudManager.deleteItem(req.params.id)

    .then(() => (
      res.sendStatus(204)
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  const refund = ({ user, params: { id: _id } }, res) => (
    Transaction.findOne({ _id, lost_id: user.username })

    .then(transaction => (
      !transaction ? Promise.reject({
        statusCode: 404,
        code: 'Not found.',
      }) : !transaction.paymentId ? Promise.reject({
        statusCode: 400,
        code: 'Payment not registered.',
      }) : !transaction.status === 'succes' ? Promise.reject({
        statusCode: 409,
        code: 'Reward already executed.',
      }) : transaction.refund({ user })
    ))

    .then(() => (
      res.status(204).json({
        succes: true,
      })
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  return {
    retrieve,
    deleteItem,
    pay,
    reward,
    refund,
  };
};
