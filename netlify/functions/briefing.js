// Drako HQ — Netlify Serverless Function
// Secure proxy between the browser and Anthropic API.
// Your ANTHROPIC_API_KEY environment variable never touches the browser.

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not configured. Add ANTHROPIC_API_KEY in Netlify → Site settings → Environment variables." }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { topic = "general" } = body;

  // Build the system prompt — deeply personalised for Drako
  const systemPrompt = `You are a financial intelligence analyst and personal advisor for Mark "Drako", a 26-year-old mortgage loan officer and entrepreneur based in Sterling Heights, Michigan.

Drako's context:
- 1099 mortgage loan officer (purchases + refinances)
- Building side hustles: AI automation tools, local web design, social content creation
- Interests: stock market, gold, real estate, crypto, de-dollarization, geopolitics
- Key frameworks he follows: petrodollar collapse, de-dollarization, $100T Boomer wealth transfer, Kiyosaki debt thesis, China's rise
- His mortgage business is directly affected by: 10-yr Treasury yields, Fed rate decisions, Iran/Middle East conflict (Hormuz), CPI data
- Investment goals: gold (GLD/IAU), AI infrastructure stocks, REITs, dividend ETFs (SCHD/VYM), healthcare (XLV), copper (COPX), uranium (NUKZ), emerging markets (VWO)

Your job: Generate a sharp, opinionated, current market briefing. Be direct and honest. No fluff. Tell him what matters TODAY, what it means for his mortgage pipeline, his investments, and his wealth-building strategy.

Format your response in clear sections using these exact headers:
## 🌍 What's Moving Markets Today
## 🏦 Fed & Rates — What It Means For Your Pipeline  
## 🥇 Gold & Real Assets
## 📈 Stocks & AI
## ⚡ Drako's Action Item Today

Keep each section to 3-5 sentences. Be specific. Use real numbers where possible. Be the smartest guy in the room who actually gives a straight answer.`;

  const userMessage = topic === "general"
    ? "Give me today's full market briefing. What's happening right now that I need to know as a mortgage loan officer, investor, and wealth builder?"
    : `Give me a focused briefing on: ${topic}. What's happening right now and what does it mean for me as a mortgage loan officer and investor?`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
        tools: [{ type: "web_search_20250305", name: "web_search" }],
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

    // Extract all text blocks from the response (handles tool use + text mix)
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
