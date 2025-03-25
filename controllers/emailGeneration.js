const OpenAI = require("openai");

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
    if (jsonMatch && jsonMatch[1]) {
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
    const { emailPurpose } = req.body;

    if (!emailPurpose) {
      return res.status(400).json({ error: "Email purpose is required" });
    }

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

            // ### **Expected Output Format (JSON Only)**  
            // \`\`\`json
            // {
            //   "subject": "Generated subject line",
            //   "body": "Generated email content",
            //   "closing": "Best regards, [Your Name/Company]"
            // }
            // \`\`\`
            
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
            - Apply the requested changes while ensuring the email remains **professional, engaging, and aligned with its purpose**.
            - Keep the tone **consistent** with the original intent (formal/casual).
            - Maintain the **structure**:  
              1. **Strong subject line**  
              2. **Compelling introduction**  
              3. **Clear main message**  
              4. **Call to action**  
              5. **Professional closing**  
            - Ensure the final output **flows naturally** and improves readability.
            
            ### **Output Format (JSON Only)**
            \`\`\`json
            {
              "subject": "Updated subject line",
              "body": "Updated email content",
              "closing": "Best regards, [Your Name/Company]"
            }
            \`\`\`
            
            - **No additional explanations or comments.**`,
        },
      ],
    });

    // Extract JSON safely
    const extractedData = extractJson(completion.choices[0]?.message);
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

module.exports = { GenerateEmail, MakeChangesToEmail };
