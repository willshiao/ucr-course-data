'use strict'

const mongoose = require('mongoose')
const {Schema} = mongoose

const timeSchema = new Schema({
  beginTime: String,
  building: String,
  buildingDescription: String,
  campus: String,
  campusDescription: String,
  category: String,
  class: String,
  courseReferenceNumber: String,
  creditHourSession: Number,
  endDate: String,
  endTime: String,
  friday: Boolean,
  hoursWeek: 2.5,
  meetingScheduleType: String,
  monday: Boolean,
  room: Schema.Types.Mixed,
  saturday: Boolean,
  startDate: String,
  sunday: Boolean,
  term: String,
  thursday: Boolean,
  tuesday: Boolean,
  wednesday: Boolean
})

module.exports = mongoose.model('MeetingTime', timeSchema)
