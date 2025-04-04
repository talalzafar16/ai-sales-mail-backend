const express = require("express");
const {
  enableAutomatedReply,
  removeAutomatedReply,
  getAutomationByCompaignId,
  updateAutomatedReply,
} = require("../controllers/AutomatedReplyController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/enableAutomation", authMiddleware, enableAutomatedReply);
router.get("/removeAutomation/:id", authMiddleware, removeAutomatedReply);
router.get(
  "/getAutomationByCompaignId/:id",
  authMiddleware,
  getAutomationByCompaignId
);
router.put("/updateAutomatedReply/:id", authMiddleware, updateAutomatedReply);

module.exports = router;
