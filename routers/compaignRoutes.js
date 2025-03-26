const express = require("express");
const {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  getTotalCampaigns,
} = require("../controllers/CampaignController");

const router = express.Router();

router.post("/create", createCampaign);
router.get("/total", getTotalCampaigns);
router.get("/getAll", getAllCampaigns);
router.get("/getById/:id", getCampaignById);

module.exports = router;
