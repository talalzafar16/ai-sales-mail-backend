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

    hasFollowUp: {
      type: Boolean,
      default: false,
    },
    followUpDuration: {
      type: Number,
      default: null,
    },
    isAutomatedReply: {
      type: Boolean,
      default: false,
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
      type: Number,
      required: true,
    },
    totalEmailOpened: {
      type: Number,
      required: true,
    },
    totalEmailReplied: {
      type: Number,
      required: true,
    },
    recipients: [],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);
