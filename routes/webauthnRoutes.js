const express = require("express");
const router = express.Router();

const {
  registerOptions,
  verifyRegistration,
} = require("../controllers/webauthnController");

router.post("/register/options", registerOptions);
router.post("/register/verify", verifyRegistration);

module.exports = router;