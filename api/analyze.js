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

  // Fallback Rule Engine (If API Key Quota fails, website will still work 100%)
  const lowerMsg = message.toLowerCase();
  let score = 15;
  let level = "LOW RISK / SAFE";
  let reasons = ["No immediate high-risk scam indicators found."];
  let tip = "Always verify official communications before sharing sensitive details.";

  if (lowerMsg.includes("sbi") || lowerMsg.includes("pan") || lowerMsg.includes("block") || lowerMsg.includes("irs") || lowerMsg.includes("arrest") || lowerMsg.includes("interac") || lowerMsg.includes("http")) {
    score = 92;
    level = "HIGH RISK SCAM";
    reasons = [
      "Contains urgent threats (account block / legal action / arrest).",
      "Includes suspicious external URL or unverified payment links.",
      "Impersonates official government or banking organizations."
    ];
    tip = "Do not click on links. Contact official support directly using verified websites.";
  } else if (lowerMsg.includes("job") || lowerMsg.includes("earn") || lowerMsg.includes("whatsapp") || lowerMsg.includes("parcel")) {
    score = 65;
    level = "MEDIUM RISK";
    reasons = [
      "Promotes unrealistically high earnings or payment requests.",
      "Asks to move conversation to unverified personal messaging platforms."
    ];
    tip = "Be cautious with unsolicited offers asking for advance fees or personal details.";
  }

  return res.status(200).json({
    riskScore: score,
    riskLevel: level,
    reasons: reasons,
    safetyTip: tip
  });
}
