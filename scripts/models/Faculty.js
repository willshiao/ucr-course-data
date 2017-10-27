'use strict'

const mongoose = require('mongoose')
const {Schema} = mongoose
const findOrCreate = require('mongoose-findorcreate')

const facultySchema = new Schema({
  bannerId: String,
  category: Schema.Types.Mixed,
  class: String,
  courseReferenceNumber: String,
  displayName: String,
  emailAddress: String,
  primaryIndicator: Boolean,
  term: String
})

facultySchema.plugin(findOrCreate)

module.exports = mongoose.model('Faculty', facultySchema)
