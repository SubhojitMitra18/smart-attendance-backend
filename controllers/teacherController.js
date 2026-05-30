const Teacher = require("../models/Teacher");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// REGISTER TEACHER
exports.registerTeacher = async (req, res) => {
  try {
    const { name, email, password, subjects } = req.body;

    // check existing teacher
    const teacherExists = await Teacher.findOne({ email });

    if (teacherExists) {
      return res.status(400).json({
        message: "Teacher already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create teacher
    const teacher = await Teacher.create({
      name,
      email,
      password: hashedPassword,
      subjects,
    });

    res.status(201).json({
      message: "Teacher Registered",
      teacher,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// LOGIN TEACHER
exports.loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find teacher
    const teacher = await Teacher.findOne({ email });

    if (!teacher) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(
      password,
      teacher.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    // generate jwt
    const token = jwt.sign(
      {
        id: teacher._id,
      },
      'secret_key',
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      teacher,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};