const express = require("express");
const router = express.Router();

const {
  authOptions,
  authVerify,
} = require("../controllers/webauthnAuthController");

router.post("/auth/options", authOptions);
router.post("/auth/verify", authVerify);

module.exports = router;