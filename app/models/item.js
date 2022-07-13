const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  count: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    required: false
  },
  clearTargetDate: {
    type: String,
    required: false
  },
  bayId: {
    type: String,
    required: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Item', itemSchema)
