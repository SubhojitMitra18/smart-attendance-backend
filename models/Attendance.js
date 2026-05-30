const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
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

  date: {
    type: String, // YYYY-MM-DD (important for daily limit)
    required: true,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

attendanceSchema.index(
  { studentId: 1, date: 1 },
  { unique: true } // 🚨 prevents multiple attendance per day
);

module.exports = mongoose.model("Attendance", attendanceSchema);