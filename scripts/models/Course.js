'use strict'

const mongoose = require('mongoose')
const config = require('config')
const {Schema} = mongoose
const Faculty = require('./Faculty').schema

const courseSchema = new Schema({
  id: Number,
  term: {
    type: String,
    default: config.get('catalog.term').toString()
  },
  termDesc: String,
  courseReferenceNumber: String,
  partOfTerm: String,
  courseNumber: String,
  subject: String,
  subjectDescription: String,
  sequenceNumber: String,
  campusDescription: String,
  scheduleTypeDescription: String,
  courseTitle: String,
  creditHours: Number,
  maximumEnrollment: Number,
  enrollment: Number,
  seatsAvailable: Number,
  waitCapacity: Number,
  waitCount: Number,
  waitAvailable: Number,
  openSection: Boolean,
  linkIdentifier: String,
  isSectionLinked: Boolean,
  subjectCourse: String,
  faculty: [{ type: Schema.Types.ObjectId, ref: Faculty }],

  pollTime: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Course', courseSchema)
