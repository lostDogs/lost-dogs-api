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
  reporter_id: String,
  image_url: String,
  uploadImageUrl: String,

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
    imageFileType: 'fileType',
    username: 'reporter_id',
  },

  infoMap: {
    _id: '_id',
    name: 'name',
    kind: 'kind',
    description: 'description',
    found_date: 'found_date',
    reporter_id: 'reporter_id',
    created_at: 'created_at',
    uploadImageUrl: 'uploadImageUrl',
    image_url: 'image_url',
  },

  createRequiredFieldsList: 'name kind found_date fileType reporter_id'.split(' '),
};
