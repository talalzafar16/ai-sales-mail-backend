const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema(
  {
    templateName: {
      type: String,
      required: true,
    },
    templatePurpose: {
      type: String,
      required: true,
    },
    emailSubject: {
      type: String,
      required: true,
    },
    emailBody: {
      type: String,
      required: true,
    },
    emailClosing: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("emailtemplate", emailTemplateSchema);
