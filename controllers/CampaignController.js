const Campaign = require("../models/compaign");
const nodemailer = require("nodemailer");



const transporter = nodemailer.createTransport({
  service: "gmail", // You can change this to your email provider
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});



const createCampaign = async (req, res) => {
    try {
      const {
        campaignName,
        description,
        emailTemplateBody,
        emailTemplateSubject,
        emailTemplateClosing,
        recipients
      } = req.body;

      if (
        !campaignName ||
        !description ||
        !emailTemplateBody ||
        !emailTemplateSubject ||
        !emailTemplateClosing||
        !recipients
      ) {
        return res
          .status(400)
          .json({ message: "All required fields must be provided" });
      }
      const newCampaign = new Campaign({
        campaignName,
        description,
        emailTemplateBody,
        emailTemplateSubject,
        emailTemplateClosing,
        totalEmailSent: recipients.length,
        totalEmailOpened: 0,
        recipients : recipients.map(e => ({ ...e, opened: false }))
      });
      let columns=Object.keys(recipients[0])
      for (const recipient of recipients) {
        let subject = emailTemplateSubject;
        let body = emailTemplateBody;
        let closing = emailTemplateClosing;
      
        columns.forEach((key) => {
          subject = subject.replace(new RegExp(`{{${key}}}`, "g"), recipient[key]);
          body = body.replace(new RegExp(`{{${key}}}`, "g"), recipient[key]);
          closing = closing.replace(new RegExp(`{{${key}}}`, "g"), recipient[key]);
        });
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: recipient.email, 
          subject: subject,
          html: `
            <p>${body}</p>
            <p>${closing}</p>
            <img src="${process.env.SERVER_URL}/email/emailTracker?campaignId=${newCampaign._id}&email=${encodeURIComponent(recipient.email)}" width="1" height="1" style="display:none;" />
          `,
        };
  
        console.log(mailOptions,"mail")
      await transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error(`Error sending email to ${recipient}:`, err.message);
          } else {
            console.log(`Email sent to ${recipient}:`, info.response);
          }
        });
      }
  

      

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
};

const getAllCampaigns = async (req, res) => {
  let {page,limit=10}=req.query
  let offset=(page-1)*limit
  try {
    const total = await Campaign.countDocuments(
      {}
    )
    const campaigns = await Campaign.find(
      {},
      {
        campaignName: 1,
        description: 1,
        status: 1,
        totalEmailSent: 1,
        totalEmailOpened: 1,
      }
    ).limit(limit).skip(offset)
    
    ;
    res.status(200).json({campaigns,total});
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

const getTotalCampaigns = async (req, res) => {
  try {
    const totalCampaigns = await Campaign.countDocuments({});
    

    const stats = await Campaign.aggregate([
      {
        $group: {
          _id: null,
          totalEmailsSent: { $sum: "$totalEmailSent"  },
          totalOpened: { $sum:  "$totalEmailOpened"  },
        },
      },
    ]);
    console.log(stats,"stats")
    const totalEmailsSent = stats[0]?.totalEmailsSent || 0;
    const totalOpened = stats[0]?.totalOpened || 0;

    res.status(200).json({ totalCampaigns, totalEmailsSent, totalOpened });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching campaign statistics",
      error: error.message,
    });
  }
};



module.exports = { createCampaign, getAllCampaigns, getCampaignById,getTotalCampaigns };
