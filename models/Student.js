const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  rollNumber: {
    type: String,
    required: true,
    unique: true,
  },

  department: {
    type: String,
    required: true,
  },

  year: {
    type: Number,
    required: true,
  },

  // optional future use (NOT required now)
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Student", studentSchema);