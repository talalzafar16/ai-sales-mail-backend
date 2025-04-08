const mongoose = require("mongoose");

const FollowUpSchema = new mongoose.Schema(
  {
    campaignId: {
      type: String,
      required: true,
    },
    emailTemplateBody: {
      type: String,
      required: true,
    },
    emailTemplateSubject: {
      type: String,
      required: true,
    },
    emailTemplateClosing: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("followupemail", FollowUpSchema);
