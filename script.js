async function analyzeMessage() {
  let rawText = document.getElementById("message").value;
  let result = document.getElementById("result");

  if (!rawText.trim()) {
    alert("Please paste a message first!");
    return;
  }

  result.style.display = "block";
  result.innerHTML = `<h3>🔍 Analyzing message with Gemini AI...</h3>`;

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: rawText })
    });

    const data = await response.json();

    if (data.error) {
      result.innerHTML = `<h3 style="color:red;">Error: ${data.error}</h3>`;
      return;
    }

    let reasonsHTML = "";
    if (data.reasons && data.reasons.length > 0) {
      reasonsHTML += "<div style='margin: 15px 0;'><strong>🔍 Why this score was given:</strong><ul style='padding-left: 20px; margin-top: 8px;'>";
      data.reasons.forEach(function(item) {
        reasonsHTML += `<li class="reason">⚠️ ${item}</li>`;
      });
      reasonsHTML += "</ul></div>";
    }

    let riskClass = "safe";
    if (data.riskScore >= 65) riskClass = "high";
    else if (data.riskScore >= 30) riskClass = "medium";

    result.innerHTML = `
      <h2 class="${riskClass}">${data.riskLevel}</h2>
      <h3>Risk Score: ${data.riskScore}%</h3>
      ${reasonsHTML}
      <p class="tip">🛡️ <strong>Safety Tip:</strong> ${data.safetyTip}</p>
      <button class="copy-btn" onclick="copyReport(${data.riskScore})">📋 Copy Incident Report Summary</button>
    `;

  } catch (err) {
    result.innerHTML = `<h3 style="color:red;">Failed to analyze message. Please try again.</h3>`;
  }
}

function clearInput() {
  document.getElementById("message").value = "";
  document.getElementById("result").style.display = "none";
}

function copyReport(riskScore) {
  let msg = document.getElementById("message").value;
  let reportText = `[ScamShield AI Report]\nRisk Assessment: ${riskScore}%\nSuspicious Message Text:\n"${msg}"\n\nReported via ScamShield AI Security Assistant.`;
  
  navigator.clipboard.writeText(reportText).then(() => {
    alert("Report summary copied to clipboard!");
  });
}
