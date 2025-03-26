const express = require("express");
const {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  getTotalCampaigns,
} = require("../controllers/CampaignController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create",authMiddleware, createCampaign);
router.get("/total", authMiddleware,getTotalCampaigns);
router.get("/getAll",authMiddleware, getAllCampaigns);
router.get("/getById/:id", authMiddleware,getCampaignById);

module.exports = router;
