const express = require("express");
const {
  enableFollowUp,
  removeFollowUp,
  getFollowUpByCompaignId,
  updateFollowUp,
} = require("../controllers/FollowUpEmailController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/enableFollowUp", authMiddleware, enableFollowUp);
router.get("/removeFollowUp/:id", authMiddleware, removeFollowUp);
router.get(
  "/getFollowUpByCompaignId/:id",
  authMiddleware,
  getFollowUpByCompaignId
);
router.put("/updateFollowUp/:id", authMiddleware, updateFollowUp);

module.exports = router;
