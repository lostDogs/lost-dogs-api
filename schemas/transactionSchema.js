// dependencies
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  found_id: String,
  lost_id: String,
  dog_id: mongoose.Schema.Types.ObjectId,
  status: {
    type: 'String',
    enum: ['success', 'failed', 'pending'],
    default: 'pending',
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
  },
  updateMap: {
    lost_id: 'lost_id',
    found_id: 'found_id',
    dog_id: 'dog_id',
    status: 'status',
  },
  infoMap: {
    id: 'id',
    lost_id: 'lost_id',
    found_id: 'found_id',
    dog_id: 'dog_id',
    status: 'status',
    created_at: 'created_at',
  },
  createRequiredFieldsList: 'found_id lost_id dog_id'.split(' '),
};
