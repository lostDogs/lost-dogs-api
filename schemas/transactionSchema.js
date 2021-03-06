// dependencies
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  found_id: String,
  lost_id: String,
  dog_id: mongoose.Schema.Types.ObjectId,
  status: {
    type: 'String',
    enum: ['unknown', 'pending', 'payment-processed', 'success', 'failed'],
    default: 'pending',
  },
  amount: String,

  qrIdentifier: String,
  paymentId: String,

    evidenceText: String,
    evidencePicture_url: String,

  deleted: {
    type: Boolean,
    default: false,
  },

  // doc managment
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = transactionSchema;

module.exports.transactionMappings = {
  createMap: {
    lost_id: 'lost_id',
    found_id: 'found_id',
    dog_id: 'dog_id',
    status: 'status',
    amount: 'amount',
    evidenceText: 'evidenceText',
    evidenceFileType: 'evidenceFileType',
    qrIdentifier: 'qrIdentifier',
  },
  updateMap: {
    lost_id: 'lost_id',
    found_id: 'found_id',
    dog_id: 'dog_id',
    status: 'status',
    amount: 'amount'
  },
  infoMap: {
    id: 'id',
    lost_id: 'lost_id',
    found_id: 'found_id',
    dog_id: 'dog_id',
    status: 'status',
    amount: 'amount',
    created_at: 'created_at',
    'evidenceText': 'evidenceText',
    'evidencePicture_url': 'evidencePicture_url'
  },
  createRequiredFieldsList: 'found_id lost_id dog_id'.split(' '),
};
