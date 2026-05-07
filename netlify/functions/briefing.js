// Drako HQ — Netlify Serverless Function v2
// Pulls LIVE data from FRED (Fed/Treasury/CPI) + Yahoo Finance (gold/oil/stocks)
// Then sends real numbers to Claude to write Drako's personalised briefing

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const fredKey = process.env.FRED_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "ANTHROPIC_API_KEY not set in Netlify environment variables." }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { topic = "general" } = body;

  // ── FETCH LIVE MARKET DATA ──────────────────────────────────────────────────

  async function fredValue(seriesId) {
    if (!fredKey) return null;
    try {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${fredKey}&file_type=json&sort_order=desc&limit=1`;
      const r = await fetch(url);
      const d = await r.json();
      const val = d.observations?.[0]?.value;
      return val === "." ? null : parseFloat(val);
    } catch {
      return null;
    }
  }

  async function yahooQuote(symbol) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const d = await r.json();
      const price = d.chart?.result?.[0]?.meta?.regularMarketPrice;
      const prev = d.chart?.result?.[0]?.meta?.chartPreviousClose;
      const change = price && prev ? (((price - prev) / prev) * 100).toFixed(2) : null;
      return price ? { price: price.toFixed(2), change } : null;
    } catch {
      return null;
    }
  }

  const [fedRate, tenYrYield, cpi, spx, gold, oil, mortgageRate] = await Promise.all([
    fredValue("FEDFUNDS"),
    fredValue("DGS10"),
    fredValue("CPIAUCSL"),
    yahooQuote("^GSPC"),
    yahooQuote("GC=F"),
    yahooQuote("BZ=F"),
    fredValue("MORTGAGE30US"),
  ]);

  const liveData = `
LIVE MARKET DATA (pulled right now):
- Fed Funds Rate: ${fedRate ? fedRate + "%" : "~3.50-3.75%"}
- 10-Year Treasury Yield: ${tenYrYield ? tenYrYield + "%" : "unavailable"}
- 30-Year Mortgage Rate: ${mortgageRate ? mortgageRate + "%" : "~6.20%"}
- CPI Index: ${cpi ? cpi : "unavailable"} (latest)
- S&P 500: ${spx ? spx.price + " (" + (spx.change > 0 ? "+" : "") + spx.change + "% today)" : "unavailable"}
- Gold: ${gold ? "$" + gold.price + "/oz (" + (gold.change > 0 ? "+" : "") + gold.change + "% today)" : "unavailable"}
- Brent Crude: ${oil ? "$" + oil.price + "/barrel (" + (oil.change > 0 ? "+" : "") + oil.change + "% today)" : "unavailable"}
`.trim();

  const systemPrompt = `You are a financial intelligence analyst and personal advisor for Mark "Drako", a 26-year-old mortgage loan officer and entrepreneur based in Sterling Heights, Michigan.

Drako's profile:
- 1099 mortgage loan officer (purchases + refinances), uses Bonzo CRM
- Building: AI automation tools, local web design, social content creation
- Follows: petrodollar collapse, de-dollarization, $100T Boomer wealth transfer, Kiyosaki debt thesis, China's rise
- Investments: gold (GLD/IAU), AI infrastructure (NVDA, AMD), REITs, SCHD/VYM, XLV, COPX, NUKZ, VWO

${liveData}

Macro context:
- US-Iran war (Feb 2026) disrupted Strait of Hormuz — major oil shock
- UAE exited OPEC May 1 2026 — petrodollar fracturing
- Petrodollar agreement expired 2024 — dollar losing reserve status
- Kevin Warsh new Fed Chair (replaced Powell May 15 2026) — debt reset strategy announced
- National debt $39T on-balance, $250T off-balance unfunded liabilities
- Dollar reserve share fell from 71% (2000) to 56% (2025)
- Central banks buying gold at fastest pace in 50 years
- $100T Boomer wealth transfer underway
- China buying 90% Iranian oil in Yuan — BRICS building SWIFT alternative
- Buffett Indicator at dot-com crash levels
- Iran ceasefire talks active — ceasefire = rate drop = refinance wave for Drako
- JPMorgan: gold $5,055 Q4 2026, $6,000 long-term
- Goldman: S&P 500 at 7,600 year-end

Use the LIVE numbers as the foundation. Reference actual prices. Be direct, honest, opinionated.

Format with EXACT headers:
## 🌍 What's Moving Markets Today
## 🏦 Fed & Rates — What It Means For Your Pipeline
## 🥇 Gold & Real Assets
## 📈 Stocks & AI
## ⚡ Drako's Action Item Today

3-5 sentences per section. Real numbers. Straight answers.`;

  const userMessage = topic === "general"
    ? "Full market briefing using the live data. What matters for my mortgage pipeline, investments, and wealth building?"
    : `Focused briefing on: ${topic}. Use live data. What does it mean for me as a mortgage loan officer and investor?`;

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
      body: JSON.stringify({
        briefing: text,
        timestamp: new Date().toISOString(),
        liveData: { fedRate, tenYrYield, mortgageRate, spx: spx?.price, spxChange: spx?.change, gold: gold?.price, goldChange: gold?.change, oil: oil?.price, oilChange: oil?.change }
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
