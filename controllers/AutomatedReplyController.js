const nodemailer = require("nodemailer");
const automatedReplyEmail = require("../models/automatedReplyEmail");
const Campaign = require("../models/compaign");

const enableAutomatedReply = async (req, res) => {
  try {
    const {
      campaignId,
      emailTemplateBody,
      emailTemplateSubject,
      emailTemplateClosing,
    } = req.body;

    if (
      !campaignId ||
      !emailTemplateBody ||
      !emailTemplateSubject ||
      !emailTemplateClosing
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }
    const automation = new automatedReplyEmail({
      campaignId,
      emailTemplateBody,
      emailTemplateSubject,
      emailTemplateClosing,
    });
    const campaign = await Campaign.findByIdAndUpdate(campaignId, {
      isAutomatedReply: true,
    });

    await automation.save();
    res.status(201).json({
      message: "Reply Automation Setted successfully",
      automation: automation,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating campaign", error: error.message });
  }
};
const removeAutomatedReply = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }
    const automation = await automatedReplyEmail.findOneAndDelete({
      campaignId: id,
    });
    const campaign = await Campaign.findByIdAndUpdate(id, {
      isAutomatedReply: false,
    });
    res.status(201).json({
      message: "Reply Automation Removed successfully",
      automation: automation,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error creating campaign", error: error.message });
  }
};

const getAutomationByCompaignId = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await automatedReplyEmail.find({ campaignId: id });
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
const updateAutomatedReply = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    console.log(data);
    const campaign = await automatedReplyEmail.findOneAndUpdate(
      {
        campaignId: id,
      },
      data
    );
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(200).json(campaign);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error fetching campaign", error: error.message });
  }
};

module.exports = {
  enableAutomatedReply,
  removeAutomatedReply,
  getAutomationByCompaignId,
  updateAutomatedReply,
};
