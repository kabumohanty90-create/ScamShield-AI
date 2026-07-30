export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not set in Vercel' });
  }

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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await response.json();

    if (data.error) {
      // Fallback to gemini-1.5-flash if 2.5 endpoint is different
      const fallbackResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const fallbackData = await fallbackResponse.json();
      if (fallbackData.error) {
        return res.status(500).json({ error: fallbackData.error.message || 'Gemini API Error' });
      }
      const resultText = fallbackData.candidates[0].content.parts[0].text;
      return res.status(200).json(JSON.parse(resultText));
    }

    const resultText = data.candidates[0].content.parts[0].text;
    const jsonResult = JSON.parse(resultText);

    return res.status(200).json(jsonResult);
  } catch (error) {
    return res.status(500).json({ error: 'AI analysis failed: ' + error.message });
  }
}
