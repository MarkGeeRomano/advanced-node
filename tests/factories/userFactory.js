const mongoose = require('mongoose')
require('../../models/User')
const User = mongoose.model('User')

module.exports = () => {
  return new User({}).save()
}