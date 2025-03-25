const express = require("express");
const {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
} = require("../controllers/CampaignController");

const router = express.Router();

router.post("/create", createCampaign);
router.get("/getAll", getAllCampaigns);
router.get("/getById/:id", getCampaignById);

module.exports = router;
