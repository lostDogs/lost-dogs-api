// dependencies
const mongoose = require('mongoose');

const dogSchema = new mongoose.Schema({
  name: String,
  kind: String,
  description: String,
  found_date: {
    type: Date,
    default: Date.now,
  },

  // GEOJSON to manage locations
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [Number],
  },

  address: String,
  male: Boolean,
  size_id: String,
  color: String,
  pattern_id: String,
  accessories_id: [String],
  lost: Boolean,
  reward: String,

  search: Array,
  reporter_id: String,
  images: [{
    uploadImageUrl: String,
    image_url: String,
  }],

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

dogSchema.index({
  name: 1,
});

dogSchema.index({
  reporter_id: 1,
});

dogSchema.index({
  location: '2dsphere',
});

module.exports = dogSchema;

module.exports.dogMappings = {
  createMap: {
    name: 'name',
    kind: 'kind',
    description: 'description',
    found_date: 'found_date',
    reporter_id: 'reporter_id',
    images: {
      key: 'images',
      default: [],
    },
    'location.type': {
      key: 'location.type',
      default: 'Point',
    },
    'location.coordinates': 'location.coordinates',
    male: 'male',
    size_id: 'size_id',
    pattern_id: 'pattern_id',
    color: 'color',
    accessories_id: 'accessories_id',
    lost: 'lost',
    reward: 'reward',
    address: 'address',
  },

  infoMap: {
    _id: '_id',
    name: 'name',
    kind: 'kind',
    images: 'images',
    description: 'description',
    found_date: 'found_date',
    reporter_id: 'reporter_id',
    created_at: 'created_at',
    'location.coordinates': 'location.coordinates',
    male: 'male',
    size_id: 'size_id',
    pattern_id: 'pattern_id',
    color: 'color',
    accessories_id: 'accessories_id',
    lost: 'lost',
    reward: 'reward',
    address: 'address',
  },

  createRequiredFieldsList: 'name kind found_date reporter_id'.split(' '),
};
