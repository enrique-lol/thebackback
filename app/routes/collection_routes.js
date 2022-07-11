const express = require('express')
const passport = require('passport')

const Collection = require('../models/collection')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

router.get('/collections', (req, res, next) => {
  Collection.find()
    .then(collection => {
      return collection.map(collection => collection.toObject())
    })
    .then(collection => res.status(200).json({ collection: collection }))
    .catch(next)
})

router.get('/collection/:id', (req, res, next) => {
  Collection.findById(req.params.id)
    .then(handle404)
    .then(collection => res.status(200).json({ collection: collection.toObject() }))
    .catch(next)
})

router.post('/collections', requireToken, (req, res, next) => {
  req.body.collection.owner = req.user.id

  Collection.create(req.body.collection)
    .then(collection => {
      res.status(201).json({ collection: collection.toObject() })
    })
    .catch(next)
})

router.patch('/collection/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.collection.owner

  Collection.findById(req.params.id)
    .then(handle404)
    .then(collection => {
      requireOwnership(req, collection)

      return collection.updateOne(req.body.collection)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

router.delete('/collection/:id', requireToken, (req, res, next) => {
  Collection.findById(req.params.id)
    .then(handle404)
    .then(collection => {
      requireOwnership(req, collection)
      collection.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
