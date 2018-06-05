//dependencies
const mongoose = require('mongoose');

// models
const CrudManager = require('./crudManager');
const Dog = require('../models/Dog');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// libs
const { handle } = require('../lib/errorHandler');
const { createFbAdEmail, seenBy } = require('../outbound/email');
const moment = require('moment');

module.exports = () => {
  const crudManager = CrudManager(Dog);

  const create = ({ body, user }, res) => (
    Dog.createMap(Object.assign(body, {matched: false}))

    .then(createBody => (
      createBody.lost && (!body.paymentInfo || body.paymentInfo.amount !== 66 + (body.ad.set.dailyBudget / 100 *  body.ad.set.endTime)) ? Promise.reject({
        statusCode: 400,
        code: 'Amount does not match.',
      }) : Dog.create(Object.assign(createBody, { username: user.username, facebookAds: {endDate: body.ad && body.ad.set &&moment().add(body.ad.set.endTime * 24 + 1, 'hours').format('YYYY-MM-DD HH:mm:ss Z')} }))
    ))

    .then(dog => (
      (body.paymentInfo &&  !(/admin/g.test(user.role)) ? dog.addPayment({ paymentInfo: body.paymentInfo, user, saveCard: body.saveCard }) : Promise.resolve({}))

      .then(paymentInfo => (
        (/admin/g.test(user.role)) || !body.ad || !body.paymentInfo ? res.status(201).json(Object.assign(dog.getInfo(), { paymentInfo})) : dog.createFbAd(Object.assign(body, {dogId: dog.id, userEmail: user.email}))

        .then(fbAd => {
          body.paymentInfo && createFbAdEmail({dog: dog.getInfo(), paymentInfo, fbAd, user});
          return res.status(201).json(Object.assign(dog.getInfo(), { paymentInfo, fbAd }))
        })

        .catch(error => {
          body.paymentInfo && createFbAdEmail({dog: dog.getInfo(), error, paymentInfo, user });
          return res.status(201).json(Object.assign(dog.getInfo(), { paymentInfo, fbAd: {error} }));
        })

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

   const updateSeen = (req, res) => (
    Dog.updateMap(req.body)

    .then(updateBody => {
      return !req.body.seenBy ? Promise.reject({
        statusCode: 401,
        code: 'Not authorized.',
      }) : Dog.findOne({ _id: req.params.id})

      .then(dog => (!dog ? Promise.reject({
        statusCode: 404,
        code: 'Not found.',
      }) : Promise.resolve(dog)))

      .then(dog => {
        req.body.seenBy && dog.seenBy.push(updateBody.seenBy);

        return dog.save()

        .then(() => {
          !~dog.subscribers.indexOf(dog.reporter_id) && dog.subscribers.push(dog.reporter_id);
          return dog.subscribers.length && User.find({
            '_id': {
              $in: dog.subscribers.map((subcriptor) => (
                mongoose.Types.ObjectId(subcriptor)
              ))
            }
          }, 'name email')
        })

        .then((subscriptors) => (
          seenBy({subscriptors, dog: dog.getInfo(), reporter: req.user.name, ownerId: dog.reporter_id , seenBy: req.body.seenBy})

          .then(()=> (
            res.json(dog.getInfo())
          ))
        ))
      })
    })

    .catch(err => (
      handle(err, res)
    ))
  ); 

  const updateSubscribers = (req, res) => (
    Dog.updateMap(req.body)

        .then(updateBody => {
          return !(req.body.subscriber || req.body.unsubscriber) ? Promise.reject({
            statusCode: 401,
            code: 'Not authorized.',
          }) : Dog.findOne({ _id: req.params.id})

          .then(dog => {
            req.body.subscriber && !~dog.subscribers.indexOf(req.body.subscriber) && dog.subscribers.push(req.body.subscriber);
            req.body.unsubscriber && ~dog.subscribers.indexOf(req.body.unsubscriber) && dog.subscribers.splice(dog.subscribers.indexOf(req.body.unsubscriber), 1);
            return dog.save()
            .then(() => (
              res.json(dog.getInfo())
            ))
          })
        })    
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
    updateSeen,
    updateSubscribers,
    deleteItem,
    search,
    found,
    lost,
  };
};
