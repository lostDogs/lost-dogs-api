const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
  name: String,
  kind_id: String,
  description: String,
  found_date: {
    type: Date,
    default: Date.now,
  },

  location: {
    address: String,
    latLong: { lat: Number, lng: Number },
  },
  male: Boolean,
  size_Id: String,
  color: String,
  pattern_Id: String,
  accessories_Id: [String],
  lost: Boolean,
  reward: Boolean,

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
    reporter_id: 'reporter_id',
    'location.lat': 'location.lat',
    'location.lng': 'location.lng',
    male: 'male',
    size_Id: 'size_Id',
    pattern_Id: 'pattern_Id',
    color: 'color',
    accessories_Id: 'accessories_Id',
    lost: 'lost',
    reward: 'reward',
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
    'location.lat': 'location.lat',
    'location.lng': 'location.lng',
    male: 'male',
    size_Id: 'size_Id',
    pattern_Id: 'pattern_Id',
    color: 'color',
    accessories_Id: 'accessories_Id',
    lost: 'lost',
    reward: 'reward',
  },

  createRequiredFieldsList: 'name kind found_date fileType reporter_id'.split(' '),
};
