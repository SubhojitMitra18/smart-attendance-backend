const {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");

const Student = require("../models/Student");

// CONFIG
const rpID = "smart-attendance-frontend-bice.vercel.app";
const origin = "https://smart-attendance-frontend-bice.vercel.app";


// ===============================
// STEP 1: GET AUTH OPTIONS
// ===============================
exports.authOptions = async (req, res) => {
  try {
    const { rollNumber } = req.body;

    const student = await Student.findOne({ rollNumber });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.credentialID || !student.credentialPublicKey) {
      return res.status(400).json({
        message: "Fingerprint not registered",
      });
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

    // store challenge
    student.currentChallenge = options.challenge;
    await student.save();

    return res.json(options);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// ===============================
// STEP 2: VERIFY AUTH
// ===============================
exports.authVerify = async (req, res) => {
  try {
    const { rollNumber, credential } = req.body;

    const student = await Student.findOne({ rollNumber });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.currentChallenge) {
      return res.status(400).json({
        message: "Session expired. Try again.",
      });
    }

    // IMPORTANT: SAFE BUFFER CONVERSION
    const credentialPublicKey = Buffer.from(
      student.credentialPublicKey,
      "base64"
    );

    const verification = await verifyAuthenticationResponse({
      response: credential,

      expectedChallenge: student.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,

      authenticator: {
        credentialID: student.credentialID,
        credentialPublicKey,
        counter: student.counter ?? 0,
      },
    });

    if (!verification.verified) {
      return res.status(400).json({
        message: "Fingerprint verification failed",
      });
    }

    // UPDATE COUNTER SAFELY
    student.counter = verification.authenticationInfo?.newCounter ?? student.counter ?? 0;

    // CLEAR CHALLENGE
    student.currentChallenge = null;

    await student.save();

    return res.json({
      message: "Authentication successful",
      studentId: student._id,
      rollNumber: student.rollNumber,
      department: student.department,
      year: student.year,
    });

  } catch (error) {
    console.error("WEBAUTHN ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};