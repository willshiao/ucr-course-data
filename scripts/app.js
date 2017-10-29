'use strict'

const mongoose = require('mongoose')
const config = require('config')
const _ = require('lodash')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
mongoose.Promise = Promise

const getCatalog = require('./catalog.js')
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

async function fetchData () {
  const catalog = await getCatalog()
  return catalog
  // console.log(catalog)
}

(async function () {
  await mongoose.connect(config.get('db.uri'), config.get('db.options'))
  logger.debug('Connected to database.')
  const catalog = await fetchData()
  logger.debug('Fetched data')

  const chunks = _.chunk(catalog, 200)

  console.time('insertion')

  await Promise.each(chunks, async chunk => {
    await Promise.map(chunk, async item => {
      item.faculty = await Promise.map(item.faculty, async faculty => {
        if (idCache[faculty.bannerId]) return idCache[faculty.bannerId]
        const doc = await Faculty.findOrCreate({ bannerId: faculty.bannerId }, _.omit(faculty, 'bannerId'), faculty)
        idCache[faculty.bannerId] = doc.doc._id
        return doc.doc._id || null
      })
      return item
    })
    await Course.insertMany(chunk)
  })
  console.timeEnd('insertion')
  logger.debug('Inserted data')
})()
