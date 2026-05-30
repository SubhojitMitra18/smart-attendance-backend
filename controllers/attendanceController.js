const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const AttendanceSession = require("../models/AttendanceSession");

function calculateDistance(lat1, lon1, lat2, lon2) {

  const R = 6371e3;

  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;

  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) *
    Math.cos(φ2) *
    Math.sin(Δλ / 2) *
    Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  );

  return R * c;
}
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, latitude, longitude } = req.body;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const session = await AttendanceSession.findOne({
      department: student.department,
      year: student.year,
      active: true,
      endTime: { $gt: new Date() },
    });

    if (!session) {
      return res.status(400).json({
        message: "No active session for your class",
      });
    }

    // GEO CHECK
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

    // DUPLICATE CHECK
    const alreadyMarked = await Attendance.findOne({
      studentId: student._id,
      sessionId: session._id,
    });

    if (alreadyMarked) {
      return res.status(400).json({
        message: "Attendance already marked",
      });
    }

    await Attendance.create({
      studentId: student._id,
      sessionId: session._id,
      rollNumber: student.rollNumber,
      department: student.department,
      year: student.year,
      latitude,
      longitude,
    });

    res.status(201).json({
      message: "Attendance Marked Successfully",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};