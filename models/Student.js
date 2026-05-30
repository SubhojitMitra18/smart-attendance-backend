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

  // WebAuthn credentials
  credentialID: {
    type: String,
    default: null,
  },

  credentialPublicKey: {
    type: String,
    default: null,
  },

  counter: {
    type: Number,
    default: 0,
  },

  // temporary challenge for registration
  currentChallenge: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("Student", studentSchema);