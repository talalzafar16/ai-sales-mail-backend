const Campaign = require("../models/compaign");
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");

const upload = multer({ dest: "public/uploads/" }).single("recipientsFile");

const createCampaign = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "File upload error", error: err.message });
    }

    try {
      const {
        campaignName,
        description,
        emailTemplateBody,
        emailTemplateSubject,
        emailTemplateClosing,
      } = req.body;

      if (
        !campaignName ||
        !description ||
        !emailTemplateBody ||
        !emailTemplateSubject ||
        !emailTemplateClosing
      ) {
        return res
          .status(400)
          .json({ message: "All required fields must be provided" });
      }

      let recipients = [];

      if (req.file) {
        // Read the uploaded Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON
        const parsedData = xlsx.utils.sheet_to_json(sheet);

        // Extract recipient details
        recipients = parsedData.map((row) => ({
          email: row.Email || row.email,
          name: row.Name || row.name || "",
        }));

        // Remove uploaded file after processing
        fs.unlinkSync(req.file.path);
      }

      const newCampaign = new Campaign({
        campaignName,
        description,
        emailTemplateBody,
        emailTemplateSubject,
        emailTemplateClosing,
        totalEmailSent: recipients.length.toString(),
        openRate: "0%", // Initially, open rate is 0%
        recipients,
      });

      await newCampaign.save();
      res.status(201).json({
        message: "Campaign created successfully",
        campaign: newCampaign,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating campaign", error: error.message });
    }
  });
};

const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find(
      {},
      {
        campaignName: 1,
        description: 1,
        status: 1,
        totalEmailSent: 1,
        openRate: 1,
      }
    );
    res.status(200).json(campaigns);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching campaigns", error: error.message });
  }
};

const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(200).json(campaign);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching campaign", error: error.message });
  }
};

module.exports = { createCampaign, getAllCampaigns, getCampaignById };
