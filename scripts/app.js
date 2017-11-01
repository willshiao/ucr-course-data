'use strict'

const mongoose = require('mongoose')
const config = require('config')
const _ = require('lodash')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const schedule = require('node-schedule')
mongoose.Promise = Promise

const getCatalog = require('./catalog.js')
const authHandler = require('./lib/authHandler.js')
const logger = require('./lib/logger')
const fileHelper = require('./lib/fileHelper')

const Course = require('./models/Course')
const Faculty = require('./models/Faculty')

const idCache = {} // Global cache

async function mockFetch () {
  const filename = fileHelper.getCatalogPath()
  const data = await fs.readFileAsync(filename)
  return JSON.parse(data)
}

async function fetchData (refresh = false) {
  const jar = await authHandler.getJar(refresh)
  try {
    const catalog = await getCatalog(jar)
    return catalog
  } catch (e) {
    if (e.name === 'AssertionError') return fetchData(true)
    logger.error(e)
  }
  // console.log(catalog)
}

async function fetchAndInsert () {
  logger.debug('Running fetch and insert')

  const catalog = config.get('debug') ? await mockFetch() : await fetchData()
  logger.debug('Fetched data')

  const chunks = _.chunk(catalog, 200)

  console.time('insertion')

  await Promise.each(chunks, async chunk => {
    const toInsert = []
    const queue = []

    await Promise.map(chunk, async item => {
      item.faculty = await Promise.map(item.faculty, async faculty => {
        if (idCache[faculty.bannerId]) return idCache[faculty.bannerId] // Check cache for faculty ID
        const doc = await Faculty.findOrCreate({ bannerId: faculty.bannerId }, _.omit(faculty, 'bannerId'))
        idCache[faculty.bannerId] = doc.doc._id
        return doc.doc._id || null
      })
      return item
    })

    chunk.forEach(item => {
      queue.push((async () => {
        const status = await Course.update(_.pick(item, config.get('catalog.fields')), { $inc: {span: 5} })
          .sort({ pollTime: -1 })
          .limit(1)
          .exec()

        if (status.nModified === 0) toInsert.push(item)
      })())
    })
    await Promise.all(queue)
    await Course.insertMany(toInsert)
  })
  console.timeEnd('insertion')
  logger.debug('Inserted data')
}

(async function () {
  await mongoose.connect(config.get('db.uri'), config.get('db.options'))
  logger.debug('Connected to database.')

  logger.debug('Scheduled fetch job')
  schedule.scheduleJob(config.get('catalog.cron'), fetchAndInsert)

  await fetchAndInsert()
})()
