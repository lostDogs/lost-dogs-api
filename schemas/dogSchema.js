const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
  name: String,
  kind: String,
  description: String,
  found_date: {
    type: Date,
    default: Date.now,
  },

  search: Array,

  reporter_id: mongoose.Schema.Types.ObjectId,

  // doc managment
  created_at: {
    type: Date,
    default: Date.now,
  },

  updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports.dogMappings = {
  createMap: {
    name: 'name',
    kind: 'kind',
    description: 'description',
    found_date: 'found_date',
    reporter_id: 'reporter_id',
  },

  infoMap: {
    name: 'name',
    kind: 'kind',
    description: 'description',
    found_date: 'found_date',
    reporter_id: 'reporter_id',
    created_at: 'created_at',
    _id: '_id',
  },

  createRequiredFieldsList: 'name kind found_date reporter_id'.split(' '),
};
