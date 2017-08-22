// models
const CrudManager = require('./crudManager');
const Dog = require('../models/Dog');

// libs
const ErrorHander = require('../utils/errorHandler');

module.exports = () => {
  const crudManager = CrudManager(Dog);

  const create = (req, res) => {
    crudManager.create(req.body, (err, dog) => (
      err ? ErrorHander.handle(err, res) : res.status(201).json(dog)
    ));
  };

  const search = (req, res) => {
    crudManager.search(req.query, (err, result) => (
      err ? ErrorHander.handle(err, res) : res.json(result)
    ));
  };


  const update = (req, res) => {
    crudManager.update(req.body, req.params.id, (err, dog) => {
      if (err) {
        return ErrorHander.handle(err, res);
      }

      return res.json(dog);
    });
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
