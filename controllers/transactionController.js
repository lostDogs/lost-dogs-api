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

  return {
    retrieve,
    deleteItem,
    pay,
    reward,
  };
};
