// models
const CrudManager = require('./crudManager');
const Dog = require('../models/Dog');
const Transaction = require('../models/Transaction');

// libs
const { handle } = require('../lib/errorHandler');

module.exports = () => {
  const crudManager = CrudManager(Dog);

  const create = ({ body, user }, res) => (
    Dog.createMap(body)

    .then(createBody => (
      Dog.create(Object.assign(createBody, { username: user.username }))
    ))

    .then(dog => (
      (body.paymentInfo ? dog.addPayment({ paymentInfo: body.paymentInfo, user, saveCard: body.saveCard }) : Promise.resolve({}))

      .then(paymentInfo => (
        res.status(201).json(Object.assign(dog.getInfo(), { paymentInfo }))
      ))
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  const search = (req, res) => (
    crudManager.search(req.query)

    .then(result => (
      res.json(result)
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  const update = (req, res) => (
    Dog.updateMap(req.body)

    .then(updateBody => (
      Dog.findOne({ id: req.params.id, reporter_id: req.jwtPayload.username })

      .then(dog => (!dog ? Promise.reject({
        statusCode: 401,
        code: 'Not authorized.',
      }) : Promise.resolve(dog)))

      .then(dog => (
        Object.assign(dog, updateBody).save()

        .then(() => (
          res.json(dog.getInfo())
        ))
      ))
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  const retrieve = (req, res) => (
    crudManager.retrieve(req.params.id)

      .then(dog => (
        res.status(201).json(dog)
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

  const found = ({ user, body, params }, res) => (
    crudManager.retrieve(params.id)

    .then(dog => (
      Transaction.found(Object.assign(body, {
        lost_id: user.username,
      }), dog, user)
    ))

    .then(paymentResult => (
      res.status(201).json({
        success: true,
        paymentResult,
      })
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  const lost = (req, res) => (
    crudManager.retrieve(req.params.id)

    .then(dog => (
      Transaction.lost(Object.assign(req.body, {
        found_id: req.user.username,
      }), dog)
    ))

    .then(() => (
      res.status(201).json({
        success: true,
      })
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  // const updateImage = (req, res) => {
  //   Dog.
  //   user.updateAvatar(req.body.fileType)

  //   .then(updateInfo => (
  //     res.json(updateInfo)
  //   ), err => (
  //     ErrorHander.handle(err, res)
  //   ));
  // };

  return {
    create,
    retrieve,
    update,
    deleteItem,
    search,
    found,
    lost,
  };
};
