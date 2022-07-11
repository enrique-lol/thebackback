const mongoose = require('mongoose')

const collectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  oneLiner: {
    type: String,
    required: false
  },
  description: {
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

module.exports = mongoose.model('Collection', collectionSchema)
