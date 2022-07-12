const express = require('express')
const passport = require('passport')

const Bay = require('../models/bay')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

router.get('/bay', (req, res, next) => {
  Bay.find()
    .then(bay => {
      return bay.map(bay => bay.toObject())
    })
    .then(bay => res.status(200).json({ bay: bay }))
    .catch(next)
})

router.get('/bay/:id', (req, res, next) => {
  Bay.findById(req.params.id)
    .then(handle404)
    .then(bay => res.status(200).json({ bay: bay.toObject() }))
    .catch(next)
})

router.post('/bay', requireToken, (req, res, next) => {
  req.body.bay.owner = req.user.id

  Bay.create(req.body.bay)
    .then(bay => {
      res.status(201).json({ bay: bay.toObject() })
    })
    .catch(next)
})

router.patch('/bay/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.bay.owner

  Bay.findById(req.params.id)
    .then(handle404)
    .then(bay => {
      requireOwnership(req, bay)

      return bay.updateOne(req.body.bay)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

router.delete('/bay/:id', requireToken, (req, res, next) => {
  Bay.findById(req.params.id)
    .then(handle404)
    .then(bay => {
      requireOwnership(req, bay)
      bay.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
