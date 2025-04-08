const FollowUpEmail = require("../models/FollowUpEmail");
const Campaign = require("../models/compaign");

const enableFollowUp = async (req, res) => {
  try {
    const {
      campaignId,
      emailTemplateBody,
      emailTemplateSubject,
      emailTemplateClosing,
      followUpDuration
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
    const followUp = new FollowUpEmail({
      campaignId,
      emailTemplateBody,
      emailTemplateSubject,
      emailTemplateClosing,
    });
    const campaign = await Campaign.findByIdAndUpdate(campaignId, {
      hasFollowUp: true,
      followUpDuration:followUpDuration
    });

    await followUp.save();
    res.status(201).json({
      message: "Reply Automation Setted successfully",
      automation: followUp,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating campaign", error: error.message });
  }
};
const removeFollowUp = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }
    const followUp = await FollowUpEmail.findOneAndDelete({
      campaignId: id,
    });
    const campaign = await Campaign.findByIdAndUpdate(id, {
      hasFollowUp: false,
      followUpDuration:null
    });
    res.status(201).json({
      message: "Reply Automation Removed successfully",
      automation: followUp,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error creating campaign", error: error.message });
  }
};

const getFollowUpByCompaignId = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await FollowUpEmail.find({ campaignId: id });
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
const updateFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
if(data.followUpDuration){
await Campaign.findOneAndUpdate(
    {
      _id: id,
    },
    {followUpDuration:data.followUpDuration}
  );
}
    const campaign = await FollowUpEmail.findOneAndUpdate(
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
  enableFollowUp,
  removeFollowUp,
  getFollowUpByCompaignId,
  updateFollowUp,
};
