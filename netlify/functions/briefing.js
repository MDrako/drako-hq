// Drako HQ — Netlify Serverless Function
// Secure proxy between the browser and Anthropic API.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not configured. Add ANTHROPIC_API_KEY in Netlify environment variables." }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { topic = "general" } = body;

  const systemPrompt = `You are a financial intelligence analyst and personal advisor for Mark "Drako", a 26-year-old mortgage loan officer and entrepreneur based in Sterling Heights, Michigan.

Drako's context:
- 1099 mortgage loan officer (purchases + refinances)
- Building side hustles: AI automation tools, local web design, social content creation
- Follows: petrodollar collapse, de-dollarization, $100T Boomer wealth transfer, Kiyosaki debt thesis, China rise
- Mortgage business affected by: 10-yr Treasury yields, Fed decisions, Iran/Hormuz conflict, CPI
- Investment targets: gold (GLD/IAU), AI infrastructure (NVDA, AMD), REITs, SCHD/VYM, XLV, COPX, NUKZ, VWO

Current world context (May 2026):
- US-Iran war (Feb 2026) closed Strait of Hormuz — oil ~$105/barrel, up 44%
- UAE exited OPEC May 1 2026 — petrodollar system fracturing
- Fed held at 3.50-3.75% (Apr 28-29, Powell's final meeting)
- Kevin Warsh incoming Fed Chair — 4 dissents, most divided Fed in 34 years
- Gold ~$4,520/oz (down from $5,595 Jan peak) — JPM targets $5,055 Q4 2026
- S&P 500 ~6,840 — Goldman targets 7,600 year-end, AI driving 40% of earnings growth
- 30-yr mortgage ~6.20% — peaked 6.37% March 2026
- CPI 3.3% March 2026 — re-accelerating due to oil shock
- May 15 2026: Fed Chair transition + new debt strategy announcement
- National debt $39T on-balance, $250T off-balance unfunded liabilities
- Dollar reserve share: 71% (2000) to 56% (2025) and falling
- $100T Boomer wealth transfer underway — healthcare, dividends, real estate benefit
- China buying 90% Iranian oil in Yuan — BRICS building SWIFT alternative
- Buffett Indicator at dot-com crash levels

Generate a sharp, opinionated briefing. Be direct and honest. No fluff. Real numbers.

Format with EXACT headers:
## 🌍 What's Moving Markets Today
## 🏦 Fed & Rates — What It Means For Your Pipeline
## 🥇 Gold & Real Assets
## 📈 Stocks & AI
## ⚡ Drako's Action Item Today

3-5 sentences per section. Straight answers only.`;

  const userMessage = topic === "general"
    ? "Give me today's full market briefing. What matters for my mortgage pipeline, investments, and wealth building?"
    : `Focused briefing on: ${topic}. What's happening and what does it mean for me as a mortgage loan officer and investor?`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 900,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Anthropic API error: ${errText}` }),
      };
    }

    const data = await response.json();
    const text = data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ briefing: text, timestamp: new Date().toISOString() }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
