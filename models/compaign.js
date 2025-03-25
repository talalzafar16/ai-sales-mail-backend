const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
campaignName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "sent"],
      default: "sent",
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
    totalEmailSent: {
      type: String,
      required: true,
    },
    openRate: {
      type: String,
      required: true,
    },
    recipients: [
      {
        email: { type: String, required: true },
        name: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);
