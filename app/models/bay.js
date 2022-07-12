const mongoose = require('mongoose')

const baySchema = new mongoose.Schema({
  designation: {
    type: String,
    required: true
  },
  shelfCount: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Bay', baySchema)
