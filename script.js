function analyzeMessage() {
  let rawText = document.getElementById("message").value;
  let text = rawText.toLowerCase();

  if (!text.trim()) {
    alert("Please paste a message first!");
    return;
  }

  let risk = 0;
  let reasons = [];

  function addRisk(points, reason) {
    risk += points;
    if (!reasons.includes(reason)) {
      reasons.push(reason);
    }
  }

  // 1. Link & URL Detection
  const hasLink = text.includes("http://") || 
                  text.includes("https://") || 
                  text.includes("bit.ly") || 
                  text.includes("tinyurl") || 
                  text.includes("www.") || 
                  text.includes(".com/") || 
                  text.includes(".xyz");

  if (hasLink) {
    addRisk(40, "Unverified external link/URL detected (Phishing Risk)");
  }

  // 2. Fake Investment & Job Offers
  if (text.includes("guaranteed") || text.includes("zero risk") || text.includes("100% risk free")) {
    addRisk(25, "Unrealistic promise: Claims guaranteed returns or zero risk");
  }

  if (text.includes("profit") || text.includes("earn daily") || text.includes("earning") || text.includes("work from home")) {
    addRisk(25, "High-yield investment scheme or quick daily income claim");
  }

  if (text.includes("telegram") || text.includes("whatsapp group") || text.includes("crypto")) {
    addRisk(25, "Redirects to an unverified private messaging group");
  }

  // 3. OTP & Account Theft Threats
  if (text.includes("share otp") || text.includes("send otp") || text.includes("tell me otp") || text.includes("share your otp") || text.includes("share otp with")) {
    addRisk(70, "Direct OTP request detected (High risk of account takeover)");
  }

  if (text.includes("lottery") || text.includes("won prize") || text.includes("winner")) {
    addRisk(40, "Fake lottery or prize claim attempt");
  }

  // Utility & Banking Threats
  if ((text.includes("account") || text.includes("card") || text.includes("sim") || text.includes("electricity") || text.includes("bill") || text.includes("connection")) && 
      (text.includes("blocked") || text.includes("suspended") || text.includes("deactivated") || text.includes("disconnected") || text.includes("unpaid"))) {
    addRisk(35, "Urgency tactic: Threats of service disconnection or account block");
  }

  if (text.includes("kyc") && (text.includes("expired") || text.includes("update immediately") || hasLink)) {
    addRisk(35, "Fake urgent KYC update request");
  }

  // 4. Safe Whitelist Filter
  const isNormalBankAlert = (text.includes("credited") || text.includes("debited") || text.includes("spent on card") || text.includes("otp for login")) && !hasLink;

  if (isNormalBankAlert) {
    risk = Math.max(0, risk - 40);
  }

  if (risk > 100) {
    risk = 100;
  }

  // Build Detailed Reasons List
  let result = document.getElementById("result");
  let reasonsHTML = "";

  if (reasons.length > 0) {
    reasonsHTML += "<div style='margin: 15px 0;'><strong>🔍 Why this score was given:</strong><ul style='padding-left: 20px; margin-top: 8px;'>";
    reasons.forEach(function(item) {
      reasonsHTML += `<li class="reason">⚠️ ${item}</li>`;
    });
    reasonsHTML += "</ul></div>";
  }

  // Render UI Result
  if (risk >= 65) {
    result.innerHTML = `
      <h2 class="high">🚨 HIGH RISK SCAM</h2>
      <h3>Risk Score: ${risk}%</h3>
      ${reasonsHTML}
      <p class="tip">🛡️ <strong>Safety Tip:</strong> Do not click on any links, share OTPs, or transfer money.</p>
      <button class="copy-btn" onclick="copyReport(${risk})">📋 Copy Incident Report Summary</button>
    `;
  } else if (risk >= 30) {
    result.innerHTML = `
      <h2 class="medium">⚠️ MEDIUM RISK</h2>
      <h3>Risk Score: ${risk}%</h3>
      ${reasonsHTML}
      <p class="tip">🛡️ <strong>Caution:</strong> Verify the sender through official channels before acting.</p>
      <button class="copy-btn" onclick="copyReport(${risk})">📋 Copy Incident Report Summary</button>
    `;
  } else {
    result.innerHTML = `
      <h2 class="safe">✅ LOW RISK / SAFE</h2>
      <h3>Risk Score: ${risk}%</h3>
      <p>No major scam indicators found in this message.</p>
      <p class="tip">🛡️ <strong>Safety Tip:</strong> Safe to read, but always keep your security practices active.</p>
    `;
  }

  result.style.display = "block";
}

function clearInput() {
  document.getElementById("message").value = "";
  document.getElementById("result").style.display = "none";
}

function copyReport(riskScore) {
  let msg = document.getElementById("message").value;
  let reportText = `[ScamShield AI Report]\nRisk Assessment: ${riskScore}%\nSuspicious Message Text:\n"${msg}"\n\nReported via ScamShield AI Security Assistant.`;
  
  navigator.clipboard.writeText(reportText).then(() => {
    alert("Report summary copied to clipboard! You can paste this in your complaint.");
  });
}
