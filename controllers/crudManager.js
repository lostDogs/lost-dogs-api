// dependencies
const objectMapper = require('object-mapper');

// libs
const validatePagination = require('../utils/common').validatePagination;

// static
const searchMapping = {
  searchTerms: {
    key: 'searchTerms',
    default: ' ',
  },
  page: {
    key: 'page',
    default: '0',
  },
  pageSize: {
    key: 'pageSize',
    default: '12',
  },
};

module.exports = (model) => {
  const retrieve = (id, callback) => {
    model.findById(id, (err, item) => {
      if (err) {
        return callback({
          statusCode: 500,
          code: 'Error while retrieving object.',
        });
      } else if (!item) {
        return callback({
          statusCode: 404,
          code: 'Not found.',
        });
      }

      return callback(null, item.getInfo());
    });
  };

  const create = (body, callback) => {
    model.createMap(body)
      .then(createBody => (
        model.create(createBody, (err, item) => {
          if (err) {
            return callback({
              statusCode: 500,
              code: 'Error while saving object.',
            });
          }

          return callback(null, item.getInfo());
        })
      ), err => (
        callback(err)
      ));
  };

  const update = (body, id, callback) => {
    model.updateMap(body)

      .then(updateBody => (
        model.findOneAndUpdate({ _id: id }, updateBody, (err, item) => {
          if (err) {
            return callback({
              statusCode: 500,
              code: 'Error while updating object.',
            });
          } else if (!item) {
            return callback({
              statusCode: 404,
              code: 'Not found.',
            });
          }

          return retrieve(item.id, callback);
        })
      ), err => (
        callback(err)
      ));
  };

  const search = (query, callback) => {
    const mappedQuery = objectMapper(query, searchMapping);

    // get pagination
    const pagination = validatePagination(mappedQuery.page, mappedQuery.pageSize);
    if (!pagination) {
      return callback({
        statusCode: 400,
        code: 'Invalid pagination.',
      });
    }

    const searchRequest = type => (
      new Promise((resolve, reject) => {
        model[type]({
          $and: mappedQuery.searchTerms.trim().split(' ').map(term => ({
            search: {
              $regex: term,
              $options: 'i',
            },
          })),
        }).limit(pagination.limit).skip(pagination.skip)

        .sort({
          created: -1,
        })
        .exec((err, result) => (
          err ? reject(err) : resolve(result)
        ));
      })
    );

    return Promise.all([
      searchRequest('find'),
      searchRequest('count'),
    ])

    .then((result) => {
      const hits = result[1];
      const items = result[0];

      Promise.all(items.map(item => (
        Promise.resolve(item.getInfo())
      )))

      .then(results => (
        callback(null, {
          results,
          hits,
        })
      ));
    })

    .catch(() => (
      callback({
        statusCode: 500,
        code: 'Internal server error.',
      })
    ));
  };

  const deleteItem = (id, callback) => {
    retrieve(id, (findErr) => {
      if (findErr) {
        return callback(findErr);
      }

      return model.remove({ _id: id }, (err, result) => {
        if (err) {
          return callback({
            statusCode: 500,
            code: 'Error while deleting object.',
          });
        }

        return callback(null, result);
      });
    });
  };

  return {
    create,
    retrieve,
    update,
    deleteItem,
    search,
  };
};
