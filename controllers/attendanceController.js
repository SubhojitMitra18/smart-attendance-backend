const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const AttendanceSession = require("../models/AttendanceSession");


// distance helper
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;

  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;

  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}


// ==========================
// MARK ATTENDANCE
// ==========================
exports.markAttendance = async (req, res) => {
  try {
    const {
      rollNumber,
      department,
      year,
      latitude,
      longitude,
    } = req.body;

    // STEP 1: Find student
    const student = await Student.findOne({
      rollNumber,
      department,
      year,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // STEP 2: Active session check
    const session = await AttendanceSession.findOne({
      department,
      year,
      active: true,
      endTime: { $gt: new Date() },
    });

    if (!session) {
      return res.status(400).json({
        message: "No active session for your class",
      });
    }

    // STEP 3: Geo-fencing
    const collegeLat = 22.5726;
    const collegeLng = 88.3639;

    const distance = calculateDistance(
      latitude,
      longitude,
      collegeLat,
      collegeLng
    );

    if (distance > 150) {
      return res.status(403).json({
        message: "Outside college campus",
      });
    }

    // STEP 4: DAILY LIMIT CHECK (ANTI-PROXY CORE)
    const today = new Date().toISOString().split("T")[0];

    const alreadyMarked = await Attendance.findOne({
      studentId: student._id,
      date: today,
    });

    if (alreadyMarked) {
      return res.status(400).json({
        message: "Attendance already marked for today",
      });
    }

    // STEP 5: CREATE ATTENDANCE
    await Attendance.create({
      studentId: student._id,
      sessionId: session._id,
      rollNumber: student.rollNumber,
      department: student.department,
      year: student.year,
      latitude,
      longitude,
      date: today,
    });

    return res.status(201).json({
      message: "Attendance marked successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};