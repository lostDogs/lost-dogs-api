const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
  name: String,
  surname: String,
  lastname: String,
  contact_info: {
    address: {
      int_number: String,
      ext_number: String,
      neighborhood: String,
      zip_code: String,
      city: String,
      country: String,
    },
    phone_number: {
      area_code: Number,
      number: Number,
    },
  },

  role: {
    type: String,
    enum: ['editor', 'admin', 'user'],
    default: 'user',
  },

  search: Array,

  avatar_url: String,
  email: String,
  username: String,
  password: String,
  token: String,

  updated_at: {
    type: Date,
    default: Date.now,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});


// Mappings

module.exports.userMappings = {
  createMap: {
    name: 'name',
    surname: 'surname',
    lastname: 'lastname',
    'address.int_number': 'contact_info.address.int_number',
    'address.ext_number': 'contact_info.address.ext_number',
    'address.neighborhood': 'contact_info.address.neighborhood',
    'address.zip_code': 'contact_info.address.zip_code',
    'address.city': 'contact_info.address.city',
    'address.country': 'contact_info.address.country',
    'phone_number.area_code': 'contact_info.phone_number.area_code',
    'phone_number.number': 'contact_info.phone_number.number',
    email: 'email',
    username: 'username',
    password: 'password',
    confirm_password: 'confirm_password',
    avatarFileType: 'fileType',
  },
  updateMap: {
    name: 'name',
    surname: 'surname',
    lastname: 'lastname',
    'address.int_number': 'contact_info.address.int_number',
    'address.ext_number': 'contact_info.address.ext_number',
    'address.neighborhood': 'contact_info.address.neighborhood',
    'address.zip_code': 'contact_info.address.zip_code',
    'address.city': 'contact_info.address.city',
    'address.country': 'contact_info.address.country',
    'phone_number.area_code': 'contact_info.phone_number.area_code',
    'phone_number.number': 'contact_info.phone_number.number',

    email: 'email',
  },
  infoMap: {
    name: 'name',
    surname: 'surname',
    lastname: 'lastname',
    'contact_info.address.int_number': 'address.int_number',
    'contact_info.address.ext_number': 'address.ext_number',
    'contact_info.address.neighborhood': 'address.neighborhood',
    'contact_info.address.zip_code': 'address.zip_code',
    'contact_info.address.city': 'address.city',
    'contact_info.address.country': 'address.country',
    'contact_info.phone_number.area_code': 'phone_number.area_code',
    'contact_info.phone_number.number': 'phone_number.number',

    email: 'email',
    username: 'username',
    avatar_url: 'avatar_url',
  },
  createRequiredFieldsList: 'name surname lastname contact_info.address.ext_number contact_info.address.neighborhood contact_info.address.zip_code contact_info.address.city contact_info.address.country contact_info.phone_number.area_code contact_info.phone_number.number email username password confirm_password'.split(' '),
};
