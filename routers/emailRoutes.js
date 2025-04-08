const express = require("express");
const {
  GenerateEmail,
  MakeChangesToEmail,
  TrackEmail,
  GenerateAutomatedEmail,
  GenerateAutomatedFollowUpEmail
} = require("../controllers/emailGeneration");

const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/generate", authMiddleware, GenerateEmail);
router.post("/makeChanges", authMiddleware, MakeChangesToEmail);
router.post("/generateAutomatedEmail", authMiddleware, GenerateAutomatedEmail);
router.post("/generateAutomatedFollowUpEmail", authMiddleware, GenerateAutomatedFollowUpEmail);
router.get("/emailTracker", TrackEmail);

module.exports = router;
