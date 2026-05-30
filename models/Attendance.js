const mongoose = require("mongoose");

const attendanceSchema =
  new mongoose.Schema({

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceSession",
      required: true,
    },

    rollNumber: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    latitude: Number,

    longitude: Number,

    timestamp: {
      type: Date,
      default: Date.now,
    },

  });

attendanceSchema.index(
  {
    studentId: 1,
    sessionId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Attendance",
  attendanceSchema
);