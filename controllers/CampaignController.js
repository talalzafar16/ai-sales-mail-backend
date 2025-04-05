const Campaign = require("../models/compaign");
const nodemailer = require("nodemailer");
const Imap = require("imap-simple");
const fs = require("fs");
const { simpleParser } = require("mailparser");
const compaign = require("../models/compaign");
const automatedReplyEmail = require("../models/automatedReplyEmail");

const transporter = nodemailer.createTransport({
  service: "gmail", // You can change this to your email provider
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

const imapConfig = {
  imap: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    authTimeout: 3000,
    tlsOptions: { rejectUnauthorized: false },
  },
};

const createCampaign = async (req, res) => {
  try {
    const {
      campaignName,
      description,
      emailTemplateBody,
      emailTemplateSubject,
      emailTemplateClosing,
      recipients,
    } = req.body;

    if (
      !campaignName ||
      !description ||
      !emailTemplateBody ||
      !emailTemplateSubject ||
      !emailTemplateClosing ||
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
      totalEmailReplied: 0,
      recipients: recipients.map((e) => ({
        ...e,
        email: e.email.toLowerCase(),
        opened: 0,
        replied: 0,
      })),
    });
    let columns = Object.keys(recipients[0]);

    for (const recipient of recipients) {
      let subject = emailTemplateSubject;
      let body = emailTemplateBody;
      let closing = emailTemplateClosing;
      subject = subject.replace(/(?<=\S)}}/g, "}} ");
      subject = subject.replace(/{{(?=\S)/g, " {{");
      body = body.replace(/(?<=\S)}}/g, "}} ");
      body = body.replace(/{{(?=\S)/g, " {{");
      closing = closing.replace(/(?<=\S)}}/g, "}} ");
      closing = closing.replace(/{{(?=\S)/g, " {{");
      columns.forEach((key) => {
        if (recipient[key]) {
          let regex = new RegExp(`{{${key.trim()}}}`, "g");
          subject = subject.replace(regex, recipient[key]);
          body = body.replace(regex, recipient[key]);
          closing = closing.replace(regex, recipient[key]);
        }
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipient.email,
        subject: subject,
        html: `
            <p>${body.replace(/\n/g, "<br/>")}</p> 
    <p>${closing.replace(/\n/g, "<br/>")}</p>
            <img src="${process.env.SERVER_URL}/email/emailTracker?campaignId=${
          newCampaign._id
        }&email=${encodeURIComponent(
          recipient.email
        )}" width="1" height="1" style="display:none;" />
          `,
      };

      console.log(mailOptions, "mail");
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
  let { page, limit = 10 } = req.query;
  let offset = (page - 1) * limit;
  try {
    const total = await Campaign.countDocuments({});
    const campaigns = await Campaign.find(
      {},
      {
        campaignName: 1,
        description: 1,
        isAutomatedReply: 1,
        status: 1,
        totalEmailSent: 1,
        totalEmailOpened: 1,
      }
    )
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    res.status(200).json({ campaigns, total });
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
          totalEmailsSent: { $sum: "$totalEmailSent" },
          totalOpened: { $sum: "$totalEmailOpened" },
        },
      },
    ]);
    console.log(stats, "stats");
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

const checkEmails = async () => {
  try {
    console.log("checking email");
    const connection = await Imap.connect(imapConfig);
    await connection.openBox("INBOX");
    const searchCriteria = ["UNSEEN", ["SUBJECT", "Re:"]];

    const fetchOptions = {
      bodies: "",
      markSeen: false,
    };
    const messages = await connection.search(searchCriteria, fetchOptions);
    for (const item of messages) {
      const all = item.parts.find((part) => part.which === "");
      const parsed = await simpleParser(all.body);
      const email = parsed.from.text.match(/<([^>]+)>/);
      const imgRegex = /<img\s+[^>]*src="([^"]+)"/;
      if (email[1] == process.env.EMAIL_USER) {
        return;
      }
      let comapigId = parsed.html
        .match(imgRegex)[1]
        .split("?")[1]
        .split("&")[0]
        .split("=")[1];
      const campaign = await Campaign.find({
        _id: comapigId,
        "recipients.email": email[1],
      });
      await Campaign.findOneAndUpdate(
        { _id: comapigId, "recipients.email": email[1] },
        {
          $set: { "recipients.$.replied": 1 },
          $inc: { totalEmailReplied: 1 }  
        }
      );
      let reciepntData=campaign[0].recipients.filter((e)=>e.email==email[1])
      if (campaign && campaign[0]?.isAutomatedReply) {
        const automatedReply = await automatedReplyEmail.findOne({
          campaignId: comapigId,
        });

        let subject = automatedReply.emailTemplateSubject;
      let body = automatedReply.emailTemplateBody;
      let closing = automatedReply.emailTemplateClosing;
      subject = subject.replace(/(?<=\S)}}/g, "}} ");
      subject = subject.replace(/{{(?=\S)/g, " {{");
      body = body.replace(/(?<=\S)}}/g, "}} ");
      body = body.replace(/{{(?=\S)/g, " {{");
      closing = closing.replace(/(?<=\S)}}/g, "}} ");
      closing = closing.replace(/{{(?=\S)/g, " {{");
      Object.keys(reciepntData[0]).forEach((key) => {
        if (reciepntData[0][key]) {
          let regex = new RegExp(`{{${key.trim()}}}`, "g");
          subject = subject.replace(regex, reciepntData[0][key]);
          body = body.replace(regex, reciepntData[0][key]);
          closing = closing.replace(regex, reciepntData[0][key]);
        }
      });
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: reciepntData[0].email,
        replyTo: reciepntData[0].email, 
        subject: `Re: ${subject}`,
        html: `
          <p>${body.replace(/\n/g, "<br/>")}</p>
          <p>${closing.replace(/\n/g, "<br/>")}</p>
          <br/>
          <blockquote>${parsed.text}</blockquote> <!-- Include original email -->
        `,
        inReplyTo: parsed.messageId, 
        references: parsed.references || parsed.messageId,
      };
      await transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(`Error sending email to ${recipient}:`, err.message);
        } else {
          console.log(`Email sent to ${recipient}:`, info.response);
        }
      });
    }
    }

    connection.end();
  } catch (error) {
    console.error("Error checking emails:", error);
  }
};

setInterval(checkEmails, 300000);
module.exports = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  getTotalCampaigns,
};
