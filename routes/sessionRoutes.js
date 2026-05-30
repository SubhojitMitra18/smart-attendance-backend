const express = require("express");

const router = express.Router();

const protect = require("../middleware/authmiddleware");

const {
  startSession,
  endSession,
  getActiveSessions,
} = require("../controllers/sessionController");


// start attendance
router.post("/start", protect, startSession);

// end attendance
router.put("/end/:id", protect, endSession);

// active sessions
router.get("/active", getActiveSessions);

module.exports = router;