const express = require("express");

const router = express.Router();

const {
  markAttendance,
} = require("../controllers/attendanceController");


// mark attendance
router.post("/mark", markAttendance);

module.exports = router;