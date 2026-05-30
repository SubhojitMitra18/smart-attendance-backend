const AttendanceSession = require("../models/AttendanceSession");


// START SESSION
exports.startSession = async (req, res) => {
  try {

    const {
  department,
  year,
  subject,
  room,
  duration,
} = req.body;

const endTime = new Date(
  Date.now() +
  duration * 60 * 1000
);

const existingSession =
  await AttendanceSession.findOne({
    department,
    year,
    active: true,
  });

if (existingSession) {
  return res.status(400).json({
    message:
      "An active session already exists for this class",
  });
}


    // create session
    const session = await AttendanceSession.create({
      teacherId: req.teacher,
      department,
      year,
      subject,
      room,
      endTime,
      active: true,
    });

    res.status(201).json({
      message: "Attendance Session Started",
      session,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



// END SESSION
exports.endSession = async (req, res) => {
  try {

    const session = await AttendanceSession.findByIdAndUpdate(
      req.params.id,
      {
        active: false,
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      message: "Session Ended",
      session,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



// GET ACTIVE SESSIONS
exports.getActiveSessions = async (req, res) => {
  try {

    // Expire old sessions
    await AttendanceSession.updateMany(
      {
        active: true,
        endTime: {
          $lt: new Date(),
        },
      },
      {
        active: false,
      }
    );

    const sessions =
      await AttendanceSession.find({
        active: true,
      });

    res.status(200).json(sessions);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};