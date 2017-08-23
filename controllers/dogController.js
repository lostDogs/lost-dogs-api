// models
const CrudManager = require('./crudManager');
const Dog = require('../models/Dog');

// libs
const ErrorHander = require('../utils/errorHandler');

module.exports = () => {
  const crudManager = CrudManager(Dog);

  const create = (req, res) => {
    crudManager.create(Object.assign(req.body, {
      username: req.jwtPayload.username,
    }), (err, dog) => (
      err ? ErrorHander.handle(err, res) : res.status(201).json(dog)
    ));
  };

  const search = (req, res) => {
    crudManager.search(req.query, (err, result) => (
      err ? ErrorHander.handle(err, res) : res.json(result)
    ));
  };

  const update = (req, res) => {
    Dog.updateMap(req.body)

    .then(updateBody => (
      new Promise((resolve, reject) => (
        Dog.findOne({ reporter_id: req.jwtPayload.username }, (err, dog) => (
          err || !dog ? reject({
            statusCode: 401,
            code: 'Not authorized.',
          }) :
          resolve(dog)
        ))
      ))

      .then(dog => (
        Object.assign(dog, updateBody).save(err => (
          err ? ErrorHander.handle({
            statusCode: 500,
            code: 'Erorr saving object to database.',
          }, res) : res.json(dog.getInfo())
        ))
      ))
    ))

    .catch(err => (
      ErrorHander.handle(err, res)
    ));
  };

  const retrieve = (req, res) => {
    crudManager.retrieve(req.params.id, (err, dog) => (
      err ? ErrorHander.handle(err, res) : res.status(201).json(dog)
    ));
  };

  const deleteItem = (req, res) => {
    crudManager.deleteItem(req.params.id, err => (
      err ? ErrorHander.handle(err, res) : res.sendStatus(202)
    ));
  };

  return {
    create,
    retrieve,
    update,
    deleteItem,
    search,
  };
};
