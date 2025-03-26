const EmailTemplate = require("../models/Template");

const CreateTemplate = async (req, res) => {
  try {
    const {
      templateName,
      templatePurpose,
      emailSubject,
      emailBody,
      emailClosing,
    } = req.body;

    if (
      !templateName ||
      !templatePurpose ||
      !emailSubject ||
      !emailBody ||
      !emailClosing
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newTemplate = new EmailTemplate({
      templateName,
      templatePurpose,
      emailSubject,
      emailBody,
      emailClosing,
    });

    await newTemplate.save();
    res.status(201).json({
      message: "Template created successfully",
      template: newTemplate,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating template", error: error.message });
  }
};

const GetTemplateNames = async (req, res) => {
  try {
    const templates = await EmailTemplate.find(
      {},
      {
        templateName: 1,
        templatePurpose:1
      }
    );
    res.status(200).json(templates);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching templates", error: error.message });
  }
};

const getTotalTemplates = async (req, res) => {

  try {
    const total = await EmailTemplate.countDocuments(
      {}
    )
    res.status(200).json({total});
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching templates", error: error.message });
  }
};

const GetTemplateById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(404).json({ message: "Id not provided" });
    }
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.status(200).json(template);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching template", error: error.message });
  }
};

const UpdateTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const requiredFields = [
      "templateName",
      "templatePurpose",
      "emailSubject",
      "emailBody",
      "emailClosing",
    ];
    for (let field of requiredFields) {
      if (updateData[field] !== undefined && updateData[field].trim() === "") {
        return res.status(400).json({ message: `${field} cannot be empty` });
      }
    }

    const updatedTemplate = await EmailTemplate.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    // If template not found
    if (!updatedTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json({
      message: "Template updated successfully",
      template: updatedTemplate,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating template", error: error.message });
  }
};

module.exports = {
  GetTemplateNames,
  GetTemplateById,
  CreateTemplate,
  getTotalTemplates,
  UpdateTemplateById,
};
