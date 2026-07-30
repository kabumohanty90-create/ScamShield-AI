function analyzeMessage() {
  let rawText = document.getElementById("message").value;
  let text = rawText.toLowerCase();

  let risk = 0;
  let reasons = [];

  function addRisk(points, reason) {
    risk += points;
    if (!reasons.includes(reason)) {
      reasons.push(reason);
    }
  }

  // 1. Phishing & External Links
  const urlRegex = /(https?:\/\/[^\s]+|bit\.ly\/[^\s]+|tinyurl\.com\/[^\s]+|[a-zA-Z0-9-]+\.(xyz|top|site|club|link|online|tech|ru|cn)[^\s]*)/i;
  const mentionsLink = urlRegex.test(rawText);

  if (mentionsLink) {
    addRisk(35, "Suspicious or external URL link detected");
  }

  // 2. Individual Investment & Scheme Indicators
  if (text.includes("guaranteed") || text.includes("zero risk") || text.includes("100% risk free")) {
    addRisk(25, "Unrealistic promise (guaranteed returns / zero risk)");
  }

  if (text.includes("profit") || text.includes("earn daily") || text.includes("earning") || text.includes("work from home")) {
    addRisk(25, "Quick income or daily profit claim detected");
  }

  if (text.includes("telegram") || text.includes("whatsapp group") || text.includes("crypto")) {
    addRisk(25, "Direct invitation to unverified social messaging group");
  }

  // 3. Phishing, Lottery & Threats
  if (text.includes("lottery") || text.includes("won prize") || text.includes("winner")) {
    addRisk(40, "Fake lottery or prize claim attempt detected");
  }

  if (text.includes("share otp") || text.includes("send otp") || text.includes("tell me otp")) {
    addRisk(45, "Direct OTP request detected - High risk of account takeover");
  }

  if ((text.includes("account") || text.includes("card") || text.includes("sim")) && 
      (text.includes("blocked") || text.includes("suspended") || text.includes("deactivated"))) {
    addRisk(40, "Fear-inducing account block/suspension threat detected");
  }

  if (text.includes("kyc") && (text.includes("expired") || text.includes("update immediately") || mentionsLink)) {
    addRisk(35, "Urgent fake KYC update request detected");
  }

  // 4. Safe Whitelist Filter
  const isNormalBankAlert = (text.includes("credited") || text.includes("debited") || text.includes("spent on card") || text.includes("otp for login")) && !mentionsLink;

  if (isNormalBankAlert) {
    risk = Math.max(0, risk - 40);
  }

  // Cap max risk
  if (risk > 100) {
    risk = 100;
  }

  // Render UI
  let result = document.getElementById("result");
  let reasonsHTML = "";

  reasons.forEach(function(item) {
    reasonsHTML += `<p class="reason">⚠️ ${item}</p>`;
  });

  if (risk >= 65) {
    result.innerHTML = `
      <h2 class="high">🚨 HIGH RISK SCAM</h2>
      <h3>Risk Score: ${risk}%</h3>
      ${reasonsHTML}
      <p class="tip">🛡️ Safety Tip: Never click unknown links, nor share OTPs or personal information.</p>
    `;
  } else if (risk >= 30) {
    result.innerHTML = `
      <h2 class="medium">⚠️ MEDIUM RISK</h2>
      <h3>Risk Score: ${risk}%</h3>
      ${reasonsHTML}
      <p class="tip">🛡️ Caution: Verify the sender through official channels before proceeding.</p>
    `;
  } else {
    result.innerHTML = `
      <h2 class="safe">✅ LOW RISK / SAFE</h2>
      <h3>Risk Score: ${risk}%</h3>
      <p>No major scam indicators found in this message.</p>
      <p class="tip">🛡️ Safe to read, but always keep your security practices active.</p>
    `;
  }

  result.style.display = "block";
}
