'use strict';

function ErrorHandler(options) {
  this.send = (res) => {
    res.status(options.statusCode).json({
      code: options.code,
    });
  };
}

ErrorHandler.handle = (err, res) => {
  if (err instanceof ErrorHandler) {
    return err.send(res);
  }

  console.log('An error ocurred', err);

  return new ErrorHandler({
    statusCode: err.statusCode,
    code: err.code,
  }).send(res);
};

module.exports = ErrorHandler;
