const express = require("express");
const {
  GenerateEmail,
  MakeChangesToEmail,
  TrackEmail,
} = require("../controllers/emailGeneration");

const router = express.Router();

router.post("/generate",authMiddleware, GenerateEmail);
router.post("/makeChanges",authMiddleware, MakeChangesToEmail);
router.get("/emailTracker", TrackEmail);

module.exports = router;
