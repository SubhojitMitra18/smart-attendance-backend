const Student = require("../models/Student");


// ADD STUDENT
exports.addStudent = async (req, res) => {
  try {

    const {
      name,
      rollNumber,
      department,
      year,
    } = req.body;

    // check existing student
    const existingStudent = await Student.findOne({
      rollNumber,
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "Student already exists",
      });
    }

    // create student
    const student = await Student.create({
      name,
      rollNumber,
      department,
      year,
    });

    res.status(201).json({
      message: "Student Added",
      student,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



// GET ALL STUDENTS
exports.getStudents = async (req, res) => {
  try {

    const students = await Student.find();

    res.status(200).json(students);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



// UPDATE STUDENT
exports.updateStudent = async (req, res) => {
  try {

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    res.status(200).json({
      message: "Student Updated",
      student,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



// DELETE STUDENT
exports.deleteStudent = async (req, res) => {
  try {

    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Student Deleted",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};