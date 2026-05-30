const {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");

const Student = require("../models/Student");
const AttendanceSession = require("../models/AttendanceSession");

// CONFIG (IMPORTANT)
const rpID = "smart-attendance-frontend-bice.vercel.app";
const origin = "https://smart-attendance-frontend-bice.vercel.app";


// STEP 1: GET AUTH OPTIONS (FINGERPRINT PROMPT)
exports.authOptions = async (req, res) => {
  try {
    const { rollNumber } = req.body;

    const student = await Student.findOne({ rollNumber });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.credentialID) {
      return res.status(400).json({ message: "Fingerprint not registered" });
    }

    const options = await generateAuthenticationOptions({
      allowCredentials: [
        {
          id: student.credentialID,
          type: "public-key",
        },
      ],
      userVerification: "required",
    });

    student.currentChallenge = options.challenge;
    await student.save();

    res.json(options);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// STEP 2: VERIFY AUTH + RETURN STUDENT IDENTITY
exports.authVerify = async (req, res) => {
  try {
    const { rollNumber, credential, latitude, longitude } = req.body;

    const student = await Student.findOne({ rollNumber });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // VERIFY FINGERPRINT
    const verification = await verifyAuthenticationResponse({
      response: credential,

      expectedChallenge: student.currentChallenge,

      expectedOrigin: origin,
      expectedRPID: rpID,

      authenticator: {
        credentialID: student.credentialID,
        credentialPublicKey: student.credentialPublicKey,
        counter: student.counter,
      },
    });

    if (!verification.verified) {
      return res.status(400).json({
        message: "Fingerprint verification failed",
      });
    }

    // update counter
    student.counter = verification.authenticationInfo.newCounter;
    student.currentChallenge = null;
    await student.save();

    // pass student info to next middleware (attendance flow)
    req.student = student;

    res.json({
      message: "Authentication successful",
      studentId: student._id,
      rollNumber: student.rollNumber,
      department: student.department,
      year: student.year,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};