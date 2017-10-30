// libs
const { validatePagination } = require('../utils/common');

module.exports = (model) => {
  const retrieve = id => (
    model.findById(id)

    .then(item => (!item ? Promise.reject({
      statusCode: 404,
      code: 'Not found.',
    }) : item.getInfo()))

    .catch(() => (
      Promise.reject({
        statusCode: 500,
        code: 'Error while retrieving object.',
      })
    ))
  );

  const create = body => (
    model.createMap(body)

    .then(createBody => (
      model.create(createBody)

      .then(item => (
        Promise.reolve(item.getInfo())
      ))

      .catch(() => (
        Promise.reject({
          statusCode: 500,
          code: 'Error while saving object.',
        })
      ))
    ))
  );

  const update = (id, body) => {
    model.updateMap(body)

      .then(updateBody => (
        model.findOneAndUpdate({ _id: id }, updateBody)

        .then(item => (!item ? Promise.reject({
          statusCode: 404,
          code: 'Not found.',
        }) : retrieve(item.id)))

        .catch(() => (
          Promise.reject({
            statusCode: 500,
            code: 'Error while updating object.',
          })
        ))
      ));
  };

  const search = ({ searchTerms = ' ', page = 0, pageSize = 12 }) => (
    validatePagination(page, pageSize)

    .then(({ skip, limit }) => {
      const searchRequest = type => (
        model[type]({
          $and: searchTerms.trim().split(' ').map(term => ({
            search: {
              $regex: term,
              $options: 'i',
            },
          })),
        }).limit(limit).skip(skip).sort({ created: -1 })
        .exec()
      );

      return Promise.all([searchRequest('find'), searchRequest('count')])

        .then(([items, hits]) => (
          Promise.all(items.map(item => (
            Promise.resolve(item.getInfo())
          )))

          .then(results => (
            Promise.resolve({
              results,
              hits,
            })
          ))
        ))

        .catch(() => (
          Promise.reject({
            statusCode: 500,
            code: 'Internal server error.',
          })
        ));
    })
  );

  const deleteItem = id => (
    retrieve(id)

    .then(() => (
      model.remove({ _id: id })

      .catch(() => (
        Promise.reject({
          statusCode: 500,
          code: 'Error while deleting object.',
        })
      ))
    ))
  );

  return {
    create,
    retrieve,
    update,
    deleteItem,
    search,
  };
};
