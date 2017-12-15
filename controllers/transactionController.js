// models
const CrudManager = require('./crudManager');
const Transaction = require('../models/Transaction');

// libs
const { handle } = require('../lib/errorHandler');

module.exports = () => {
  const crudManager = CrudManager(Transaction);

  const retrieve = (req, res) => (
    crudManager.retrieve(req.params.id)

      .then(dog => (
        res.status(200).json(dog)
      ))

      .catch(err => (
        handle(err, res)
      ))
  );

  const pay = ({ user, body, params: { id } }, res) => (
    crudManager.retrieve(id)

    .then(transaction => (
      transaction.pay({ user, body })

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
