const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const AttendanceSession = require("../models/AttendanceSession");


// ==========================
// MARK ATTENDANCE
// ==========================
exports.markAttendance = async (req, res) => {
  try {

    const {
      rollNumber,
      department,
      year,
    } = req.body;

    // STEP 1: Find Student

    const student = await Student.findOne({
      rollNumber,
      department,
      year,
    });

    console.log(rollNumber)
    console.log(department)
    console.log(year)

    console.log(student)

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // STEP 2: Find Active Session

    const session = await AttendanceSession.findOne({
      department,
      year,
      active: true,
      endTime: {
        $gt: new Date(),
      },
    });

    if (!session) {
      return res.status(400).json({
        message: "No active session for your class",
      });
    }

    // STEP 3: Check if attendance already marked today

    const today = new Date()
      .toISOString()
      .split("T")[0];

    const alreadyMarked =
      await Attendance.findOne({
        studentId: student._id,
        date: today,
      });

    if (alreadyMarked) {
      return res.status(400).json({
        message:
          "Attendance already marked for today",
      });
    }

    // STEP 4: Create Attendance

    await Attendance.create({
      studentId: student._id,
      sessionId: session._id,

      rollNumber: student.rollNumber,
      department: student.department,
      year: student.year,

      date: today,
    });

    return res.status(201).json({
      message:
        "Attendance marked successfully",
    });

  } catch (error) {

    console.error(
      "Attendance Error:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });

  }
};