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
  };
};
