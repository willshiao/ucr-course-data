'use strict'

const mongoose = require('mongoose')
const config = require('config')
mongoose.Promise = require('bluebird')

const logger = require('./lib/logger')

mongoose.createConnection(config.get('db.uri'), config.get('db.options'))
  .then(() => {
    logger.debug('Connected to database.')
  })
