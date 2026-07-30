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

  // 1. Link & URL Detection (Bitly, http, https, www, .com, etc.)
  const hasLink = text.includes("http://") || 
                  text.includes("https://") || 
                  text.includes("bit.ly") || 
                  text.includes("tinyurl") || 
                  text.includes("www.") || 
                  text.includes(".com/") || 
                  text.includes(".xyz");

  if (hasLink) {
    addRisk(40, "Suspicious or external URL link detected in message");
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

  // 3. Phishing, Lottery, Urgency Threats & Direct OTP Theft
  if (text.includes("share otp") || text.includes("send otp") || text.includes("tell me otp") || text.includes("share your otp") || text.includes("share otp with")) {
    addRisk(70, "Direct OTP request detected - High risk of account takeover");
  }

  if (text.includes("lottery") || text.includes("won prize") || text.includes("winner")) {
    addRisk(40, "Fake lottery or prize claim attempt detected");
  }

  // Utility, Bank & Urgency Threats
  if ((text.includes("account") || text.includes("card") || text.includes("sim") || text.includes("electricity") || text.includes("bill") || text.includes("connection")) && 
      (text.includes("blocked") || text.includes("suspended") || text.includes("deactivated") || text.includes("disconnected") || text.includes("unpaid"))) {
    addRisk(35, "Fear-inducing account block or service disconnection threat detected");
  }

  if (text.includes("kyc") && (text.includes("expired") || text.includes("update immediately") || hasLink)) {
    addRisk(35, "Urgent fake KYC update request detected");
  }

  // 4. Safe Whitelist Filter
  const isNormalBankAlert = (text.includes("credited") || text.includes("debited") || text.includes("spent on card") || text.includes("otp for login")) && !hasLink;

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
