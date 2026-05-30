const mongoose = require("mongoose");

const attendanceSessionSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
  },

  department: {
    type: String,
    required: true,
  },

  year: {
    type: Number,
    required: true,
  },

  subject: {
    type: String,
    required: true,
  },

  room: {
    type: String,
    required: true,
  },

  startTime: {
    type: Date,
    default: Date.now,
  },

  endTime: {
    type: Date,
  },

  active: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model(
  "AttendanceSession",
  attendanceSessionSchema
);