const Student = require("../models/Student");

const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} = require("@simplewebauthn/server");

const {
  isoUint8Array,
} = require("@simplewebauthn/server/helpers");

// CONFIG
const rpName = "College Attendance System";
const rpID = "smart-attendance-frontend-bice.vercel.app";
const origin = "https://smart-attendance-frontend-bice.vercel.app";


// ================================
// 1. REGISTER OPTIONS
// ================================
exports.registerOptions = async (req, res) => {
  try {
    const { rollNumber } = req.body;
    
    console.log(rollNumber)
    const student = await Student.findOne({ rollNumber });
    console.log(student)
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    if (student.credentialID) {
      return res.status(400).json({
        message: "Fingerprint already registered",
      });
    }

    const options = await generateRegistrationOptions({
      rpName,
      rpID,

      // FIX: REQUIRED Uint8Array (NO STRING ERROR)
      userID: isoUint8Array.fromUTF8String(
        student._id.toString()
      ),

      userName: student.rollNumber,
      userDisplayName: student.name,

      attestationType: "none",

      authenticatorSelection: {
        userVerification: "required",
        residentKey: "preferred",
      },
    });

    console.log(options)

    // store challenge in DB
    student.currentChallenge = options.challenge;
    await student.save();

    return res.json(options);

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};


// ================================
// 2. VERIFY REGISTRATION
// ================================
exports.verifyRegistration = async (req, res) => {
  try {
    const { rollNumber, credential } = req.body;

    console.log(credential)
    const student = await Student.findOne({ rollNumber });

    console.log(student)
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const verification = await verifyRegistrationResponse({
      response: credential,

      expectedChallenge: student.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    console.log(verification)

    if (!verification.verified) {
      return res.status(400).json({
        message: "Fingerprint verification failed",
      });
    }

    const { registrationInfo } = verification;

    student.credentialID = registrationInfo.credential.id;

    student.credentialPublicKey = Buffer.from(
      registrationInfo.credential.publicKey
    ).toString("base64");

    student.counter = registrationInfo.credential.counter;

    student.currentChallenge = null;

    await student.save();

    return res.json({
      message: "Fingerprint registered successfully",
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};


// EXPORT
module.exports = {
  registerOptions: exports.registerOptions,
  verifyRegistration: exports.verifyRegistration,
};