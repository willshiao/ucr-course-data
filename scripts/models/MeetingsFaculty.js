'use strict'

const mongoose = require('mongoose')
const {Schema} = mongoose
const Faculty = require('./Faculty').schema

const meetingsFacultySchema = new Schema({
  category: String,
  class: String,
  courseReferenceNumber: String,
  faculty: [Faculty]

})

module.exports = mongoose.model('MeetingsFaculty', meetingsFacultySchema)
