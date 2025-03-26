const express = require("express");
const {
  GenerateEmail,
  MakeChangesToEmail,
  TrackEmail,
} = require("../controllers/emailGeneration");

const router = express.Router();

router.post("/generate", GenerateEmail);
router.post("/makeChanges", MakeChangesToEmail);
router.get("/emailTracker", TrackEmail);

module.exports = router;
