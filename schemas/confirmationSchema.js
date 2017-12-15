// dependencies
const mongoose = require('mongoose');

const confirmationSchema = new mongoose.Schema({
  transaction_id: mongoose.Schema.Types.ObjectId,
  by: mongoose.Schema.Types.ObjectId,
  qrData: String,

  // doc managment
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = confirmationSchema;

module.exports.confirmationMappings = {
  createMap: {
    transaction_id: 'transaction_id',
    by: 'by',
  },
  updateMap: {
    qrData: 'qrData',
  },
  infoMap: {
    id: 'id',
    transaction_id: 'transaction_id',
    qrData: 'qrData',
    created_at: 'created_at',
  },
  createRequiredFieldsList: 'transaction_id by'.split(' '),
};
