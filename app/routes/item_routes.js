// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for items
const Item = require('../models/item')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { item: { title: '', text: 'foo' } } -> { item: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /items
router.get('/items', (req, res, next) => {
  Item.find()
    .then(item => {
      // `items` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return item.map(item => item.toObject())
    })
    // respond with status 200 and JSON of the items
    .then(item => res.status(200).json({ item: item }))
    // if an error occurs, pass it to the handler
    .catch(next)
})
router.get('/items-select/', (req, res, next) => {
  const bayId = req.body.bay
  Item.find()
    .then(item => {
      const initArray = item.map(item => item.toObject())
      const filteredArray = initArray.filter(item => item.bayId == bayId)
      return filteredArray

      })
    .then(item => res.status(200).json({ item: item }))
    .then(console.log(bayId))
    .catch(next)
})

// SHOW
// GET /items/5a7db6c74d55bc51bdf39793
router.get('/item/:id', (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Item.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "item" JSON
    .then(item => res.status(200).json({ item: item.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /items
router.post('/items', requireToken, (req, res, next) => {
  // set owner of new item to be current user
  req.body.item.owner = req.user.id

  Item.create(req.body.item)
    // respond to succesful `create` with status 201 and JSON of new "item"
    .then(console.log(req))
    .then(item => {
      res.status(201).json({ item: item.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /items/5a7db6c74d55bc51bdf39793
router.patch('/item/:id', removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.item.owner

  Item.findById(req.params.id)
    .then(handle404)
    .then(item => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      // requireOwnership(req, item)

      // pass the result of Mongoose's `.update` to the next `.then`
      return item.updateOne(req.body.item)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /items/5a7db6c74d55bc51bdf39793
router.delete('/item/:id',  (req, res, next) => {
  Item.findById(req.params.id)
    .then(handle404)
    .then(item => {
      // throw an error if current user doesn't own `item`
      // delete the item ONLY IF the above didn't throw
      item.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
