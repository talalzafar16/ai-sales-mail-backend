const express = require("express");
const {
  GenerateEmail,
  MakeChangesToEmail,
} = require("../controllers/emailGeneration");

const router = express.Router();

router.post("/generate", GenerateEmail);
router.post("/makeChanges", MakeChangesToEmail);

module.exports = router;
