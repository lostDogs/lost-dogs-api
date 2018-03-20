// models
const CrudManager = require('./crudManager');
const Dog = require('../models/Dog');
const Transaction = require('../models/Transaction');

// libs
const { handle } = require('../lib/errorHandler');

module.exports = () => {
  const crudManager = CrudManager(Dog);

  const create = ({ body, user }, res) => (
    Dog.createMap(Object.assign(body, {matched: false}))

    .then(createBody => (
      createBody.lost && (!body.paymentInfo || body.paymentInfo.amount !== 65) ? Promise.reject({
        statusCode: 400,
        code: 'Amount does not match.',
      }) : Dog.create(Object.assign(createBody, { username: user.username }))
    ))

    .then(dog => (
      (body.paymentInfo &&  !(/admin/g.test(user.role)) ? dog.addPayment({ paymentInfo: body.paymentInfo, user, saveCard: body.saveCard }) : Promise.resolve({}))

      .then(paymentInfo => (
        res.status(201).json(Object.assign(dog.getInfo(), { paymentInfo }))
      ), error => (
         crudManager.deleteItem(dog.id)
        .then(() => (handle(error, res)))
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
      Dog.findOne({ _id: req.params.id, reporter_id: req.jwtPayload.username })

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
      dog.matched ? Promise.reject({
      statusCode: 404,
      code: 'already matched.',
      }) : Transaction.found(Object.assign(body, {
        lost_id: user._id,
      }), dog, user)
    ))

    .then(({paymentResult, uploadEvidenceUrl}) => (
      res.status(201).json({
        success: true,
        paymentResult,
        uploadEvidenceUrl
      })
    ))

    .catch(err => (
      handle(err, res)
    ))
  );

  const lost = (req, res) => (
    crudManager.retrieve(req.params.id)

    .then(dog => (
      dog.matched ? Promise.reject({
      statusCode: 404,
      code: 'already matched.',
      }) : Transaction.lost(Object.assign(req.body, {
        found_id: req.user._id,
      }), dog)
    ))

    .then((uploadEvidenceUrl) => (
      res.status(201).json({
        success: true,
        uploadEvidenceUrl
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
