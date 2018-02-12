/**
 * clean.js
 *
 * This script is used to clean entries in the database gathered by previous versions of
 *   app.js
 */

'use strict'

const mongoose = require('mongoose')
const Promise = require('bluebird')
mongoose.Promise = Promise
const config = require('config')
const logger = require('./lib/logger')
const Course = require('./models/Course')

async function main () {
  await mongoose.connect(config.get('db.uri'), config.get('db.options'))
  logger.info('Connected to database.')

  logger.info('Cleaning all seminars...')
  const allSeminars = await Course.find({ scheduleTypeDescription: 'Seminar  ' })
  logger.info(`Found ${allSeminars.length} seminars!`)

  let numChanges = 0

  await Promise.map(allSeminars, async (seminar) => {
    const type = seminar.scheduleTypeDescription
    if (type[type.length - 1] === ' ') {
      if (numChanges % 1000 === 0) logger.info(`Number of changes: ${numChanges}`)
      seminar.scheduleTypeDescription = type.trim()
      numChanges++
      await seminar.save()
    } else {
      logger.debug('Item already changed')
    }
  }, { concurrency: 25 })
  logger.info(`Percent changed: ${numChanges / allSeminars.length * 100}%`)
}

main()
