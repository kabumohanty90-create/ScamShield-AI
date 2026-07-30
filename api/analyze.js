export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `You are a cybersecurity expert analyzing suspicious messages for scams.
Analyze the following message and respond ONLY with a valid JSON object in this exact format:
{
  "riskScore": <number between 0 and 100>,
  "riskLevel": "<HIGH RISK SCAM | MEDIUM RISK | LOW RISK / SAFE>",
  "reasons": ["<reason 1>", "<reason 2>"],
  "safetyTip": "<short helpful safety action>"
}

Message to analyze:
"${message}"`;

  try {
    if (apiKey) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const data = await response.json();

      if (!data.error && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const resultText = data.candidates[0].content.parts[0].text;
        return res.status(200).json(JSON.parse(resultText));
      }
    }
  } catch (err) {
    console.log("API Error, using fallback engine");
  }

  // Fallback Rule Engine
  const lowerMsg = message.toLowerCase();
  let score = 15;
  let level = "LOW RISK / SAFE";
  let reasons = ["No immediate high-risk scam indicators found."];
  let tip = "Always verify official communications before sharing sensitive details.";

  // High Risk Scam Keywords (Updated with Electricity & Delivery scams)
  const highRiskKeywords = [
    "sbi", "pan", "block", "irs", "arrest", "interac", "http", 
    "electricity", "disconnect", "bill", "courier", "parcel", 
    "package", "officer", "immediately", "police", "lottery"
  ];

  const containsHighRisk = highRiskKeywords.some(keyword => lowerMsg.includes(keyword));

  if (containsHighRisk) {
    score = 92;
    level = "HIGH RISK SCAM";
    reasons = [
      "Creates artificial urgency and panic (threat of disconnection, arrest, or financial penalty).",
      "Asks to contact an unverified personal mobile number or click third-party links.",
      "Classic impersonation technique of official utility companies or government services."
    ];
    tip = "Do not call back personal numbers or click links. Verify directly through official electricity/service portals.";
  } else if (lowerMsg.includes("job") || lowerMsg.includes("earn") || lowerMsg.includes("whatsapp") || lowerMsg.includes("telegram")) {
    score = 65;
    level = "MEDIUM RISK";
    reasons = [
      "Promotes unrealistically high earnings or payment requests.",
      "Asks to move conversation to unverified personal messaging platforms like Telegram/WhatsApp."
    ];
    tip = "Be cautious with unsolicited job offers asking for advance fees or completing task-based money offers.";
  }

  return res.status(200).json({
    riskScore: score,
    riskLevel: level,
    reasons: reasons,
    safetyTip: tip
  });
}
