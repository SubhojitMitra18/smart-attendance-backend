const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  addStudent,
  getStudents,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");


// add student
router.post("/", protect, addStudent);

// get students
router.get("/", protect, getStudents);

// update student
router.put("/:id", protect, updateStudent);

// delete student
router.delete("/:id", protect, deleteStudent);

module.exports = router;