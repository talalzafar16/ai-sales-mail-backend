const OpenAI = require("openai");
const Campaign = require("../models/compaign");
const compaign = require("../models/compaign");

const client = new OpenAI({
  apiKey:
    "xai-pA9l7Tkegg7TN8mDJE6CBOyLXWRHFLgm9H23qg0ukmlo4QRTx1gUqhMkb66CSDQkdX3FFmgY9A6W2fpH",
  baseURL: "https://api.x.ai/v1",
});

const extractJson = (data) => {
  try {
    if (!data || !data.content) {
      throw new Error("Invalid response structure: 'content' is missing.");
    }
    const jsonMatch = data.content.match(/```json\n([\s\S]+?)\n```/);
    console.log(jsonMatch[1], "jsonMatch");
    if (jsonMatch && jsonMatch[1]) {
      // let a=jsonMatch.replace(/\n/g, "\\n") // Escape newlines
      // .replace(/\t/g, "\\t"); // Escape tabs (if any)
      return JSON.parse(jsonMatch[1]);
    }
    throw new Error("No valid JSON found");
  } catch (error) {
    console.error("Error extracting JSON:", error);
    return null;
  }
};
const GenerateEmail = async (req, res) => {
  try {
    const { emailPurpose, templatePlaceholders } = req.body;

    if (!emailPurpose) {
      return res.status(400).json({ error: "Email purpose is required" });
    }

    const placeholdersString = templatePlaceholders
      ? `Use ONLY the following placeholders where appropriate: ${templatePlaceholders.join(
          ", "
        )}.`
      : "";

    const completion = await client.chat.completions.create({
      model: "grok-2-latest",
      messages: [
        {
          role: "system",
          content:
            "You are an expert email marketing assistant. Your task is to generate professional, engaging, and persuasive email templates based on the given purpose.",
        },
        {
          role: "user",
          content: `Generate an email template for the following purpose: **${emailPurpose}**. 
            
            - Ensure the email is **professional, engaging, and personalized**.
            - Keep the tone appropriate (formal/casual) based on the purpose.
            - Structure it with:
              1. **A strong subject line**
              2. **A compelling introduction**
              3. **The main message**
              4. **A call to action**
              5. **A professional closing**
            - ${placeholdersString}

  **Keeo the email formatting proper**
 **Do not use line spaces or breaks; instead, use \n\n for formatting.**  

            ### **Expected Output Format (JSON Only)**  
            \`\`\`json
            {
              "subject": "Generated subject line",
              "body": "Generated email content with placeholders like {{First Name}}",
              "closing": "Best regards, {{Sender Name}}"
            }
            \`\`\`

            - **No additional explanations or comments.**`,
        },
      ],
    });

    const extractedData = extractJson(completion.choices[0].message);
    return res.json({
      emailContent: extractedData,
    });
  } catch (error) {
    console.error("Error fetching response from Grok:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const GenerateAutomatedEmail = async (req, res) => {
  try {
    const { compaignId } = req.body;

    if (!compaignId) {
      return res.status(400).json({ error: "compaignId is required" });
    }
    const compaignData = await compaign.findById(compaignId);
    console.log(compaignData);

    const completion = await client.chat.completions.create({
      model: "grok-2-latest",
      messages: [
        {
          role: "system",
          content:
            "You are an expert email marketing assistant. Your task is to generate professional, engaging, and personalized automated email replies based on the given campaign data.",
        },
        {
          role: "user",
          content: `Generate an automated reply email template for the given campaign. The reply should acknowledge the client's response professionally and maintain engagement. 
    
    - **Ensure the tone matches the context** (formal/casual).  
    - **Structure the email properly**:
      1. **A relevant subject line**  
      2. **An engaging opening that acknowledges the client's response**  
      3. **A concise main message**  
      4. **A clear call to action (if needed)**  
      5. **A professional closing**  
        
       Email Subject  : ${compaignData.emailTemplateSubject}
       Email Body  : ${compaignData.emailTemplateBody}
       Email Closing  : ${compaignData.emailTemplateClosing}
    This is the template to which we recieve the email reply from client now we want a general automated reply for customer email

          use place holders only used in above give email tenplate 
    - **Use \\n\\n instead of line breaks for formatting.**  
    
    ### **Expected Output Format (JSON Only)**
    \`\`\`json
    {
      "subject": "Generated subject line",
      "body": "Generated email content with placeholder",
      "closing": "Best regards, {{Sender Name}}"
    }
    \`\`\`
    
    - **No additional explanations or comments.**`,
        },
      ],
    });

    const extractedData = extractJson(completion.choices[0].message);
    return res.json({
      emailContent: extractedData,
    });
  } catch (error) {
    console.error("Error fetching response from Grok:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const GenerateAutomatedFollowUpEmail = async (req, res) => {
  try {
    const { compaignId } = req.body;

    if (!compaignId) {
      return res.status(400).json({ error: "campaignId is required" });
    }

    const campaignData = await Campaign.findById(compaignId);

    const completion = await client.chat.completions.create({
      model: "grok-2-latest",
      messages: [
        {
          role: "system",
          content:
            "You are an expert email marketing assistant. Your task is to generate professional, engaging, and personalized follow-up email templates based on the given campaign data.",
        },
        {
          role: "user",
          content: `Generate a follow-up email template for the given campaign. The email should politely re-engage the recipient, remind them of the previous interaction, and encourage a response or action.
    
    - **Ensure the tone matches the context** (formal/casual).  
    - **Structure the email properly**:
      1. **A compelling subject line**  
      2. **A warm opening that references the previous email or interaction**  
      3. **A concise main message reinforcing the value proposition**  
      4. **A clear call to action (if applicable)**  
      5. **A professional closing**  
        
       Email Subject  : ${campaignData.emailTemplateSubject}
       Email Body  : ${campaignData.emailTemplateBody}
       Email Closing  : ${campaignData.emailTemplateClosing}
      
    - **Use placeholders found in the given email template**  
    - **Use \\n\\n instead of line breaks for formatting.**  

    ### **Expected Output Format (JSON Only)**
    \`\`\`json
    {
      "subject": "Generated follow-up subject line",
      "body": "Generated follow-up email content with placeholders",
      "closing": "Best regards, {{Sender Name}}"
    }
    \`\`\`
    
    - **No additional explanations or comments.**`,
        },
      ],
    });

    const extractedData = extractJson(completion.choices[0].message);
    return res.json({
      emailContent: extractedData,
    });
  } catch (error) {
    console.error("Error fetching response from Grok:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const MakeChangesToEmail = async (req, res) => {
  try {
    const {
      emailPurpose,
      emailBody,
      emailSubject,
      emailClosing,
      promptTochange,
    } = req.body;

    if (!emailPurpose || !emailBody || !emailSubject || !emailClosing) {
      return res.status(400).json({
        error:
          "All email fields are required (purpose, subject, body, closing).",
      });
    }

    const completion = await client.chat.completions.create({
      model: "grok-2-latest",
      messages: [
        {
          role: "system",
          content:
            "You are an expert email marketing assistant. Your task is to revise and enhance an existing email based on a given modification request.",
        },
        {
          role: "user",
          content: `Modify the following email based on the requested change.
            
            ### **Email Details:**
            - **Purpose:** ${emailPurpose}
            - **Existing Subject:** ${emailSubject}
            - **Existing Body:** ${emailBody}
            - **Existing Closing:** ${emailClosing}
            
            ### **Modification Request:**
            "${promptTochange}"
            
            ### **Guidelines:**
            - Apply the requested changes while ensuring the email remains **professional, engaging, well formatted, and aligned with its purpose**.
            - Keep the tone **consistent** with the original intent (formal/casual).
            - Maintain the **structure**:  
              1. **Strong subject line**  
              2. **Compelling introduction**  
              3. **Clear main message**  
              4. **Call to action**  
              5. **Professional closing**  
            - Ensure the final output **flows naturally** and improves readability.
            
          use place holders only used in above give email tenplate 
    - **Use \\n\\n instead of line breaks for formatting.**  
 
             ### **Output Format (JSON Only)**
         Return **ONLY** a valid JSON object (no code block, no additional text):
            \`\`\`json
            {
              "subject": "Updated subject line",
              "body": "Updated email content",
              "closing": "Best regards, [Your Name/Company]"
            }
            \`\`\`
            

            - **No additional explanations or comments.**
            - **Do not remove or add any place holder**`,
        },
      ],
    });

    // Extract JSON safely
    const extractedData = extractJson(completion.choices[0].message);

    if (!extractedData) {
      return res
        .status(500)
        .json({ error: "Failed to generate email modifications." });
    }

    return res.json({
      emailContent: extractedData,
    });
  } catch (error) {
    console.error("Error fetching response from Grok:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const TrackEmail = async (req, res) => {
  const { campaignId, email } = req.query;

  if (!campaignId || !email) {
    return res.status(400).send("Invalid tracking request");
  }

  try {
    const campaign = await Campaign.findOne(
      { _id: campaignId, "recipients.email": email },
      { "recipients.$": 1, totalEmailOpened: 1 }
    );

    if (!campaign || campaign.recipients.length === 0) {
      return res.status(404).send("Campaign or recipient not found");
    }

    const recipient = campaign.recipients[0];

    const updateQuery = {
      $inc: { "recipients.$.opened": 1 },
    };

    if (recipient.opened === 1) {
      updateQuery.$inc.totalEmailOpened = 1;
    }

    if (recipient.opened < 2) {
      await Campaign.updateOne(
        { _id: campaignId, "recipients.email": email },
        updateQuery
      );
    }

    return sendTrackingPixel(res);
  } catch (error) {
    console.error("Error tracking email open:", error);
    res.status(500).send("Error tracking email open");
  }
};

// Function to send tracking pixel
const sendTrackingPixel = (res) => {
  const pixel = Buffer.from(
    "47494638396101000100800000ffffffffffff21f90401000001002c00000000010001000002024401",
    "hex"
  );

  res.setHeader("Content-Type", "image/gif");
  res.setHeader("Content-Length", pixel.length);
  return res.end(pixel);
};

module.exports = {
  GenerateEmail,
  MakeChangesToEmail,
  TrackEmail,
  GenerateAutomatedEmail,
  GenerateAutomatedFollowUpEmail
};
