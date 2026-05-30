const express = require("express");

const router = express.Router();

const {
  registerTeacher,
  loginTeacher,
} = require("../controllers/teacherController");


// register
router.post("/register", registerTeacher);

// login
router.post("/login", loginTeacher);

module.exports = router;