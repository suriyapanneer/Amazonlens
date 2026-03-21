/**
 * Claude AI integration for market insights
 */

const Anthropic = require('@anthropic-ai/sdk').default;

function getClient() {
  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

/**
 * Analyze products and generate market insights
 */
async function getMarketInsights(products, stats) {
  const client = getClient();
  if (!client) return null;

  const topProducts = products
    .sort((a, b) => (b.opportunity_score || 0) - (a.opportunity_score || 0))
    .slice(0, 20);

  const productSummary = topProducts.map(p =>
    `- ${(p.title || '').slice(0, 60)} | ₹${p.price} | Rev: ₹${p.monthly_revenue}/mo | Reviews: ${p.reviews} | Rating: ${p.rating} | Score: ${p.opportunity_score} | Verdict: ${p.verdict} | Sellable: ${p.sellable ? 'Yes' : 'No'}`
  ).join('\n');

  const prompt = `You are an expert Amazon India FBA product analyst. Analyze this market data and provide actionable insights for a seller looking to enter this market.

**Market Stats:**
- Total Products: ${stats.totalProducts || 0}
- Total Monthly Revenue: ₹${stats.totalRevenue?.toLocaleString('en-IN') || 0}
- Average Price: ₹${stats.avgPrice?.toFixed(0) || 0}
- Average Reviews: ${stats.avgReviews?.toFixed(0) || 0}
- Average Rating: ${stats.avgRating?.toFixed(1) || 0}
- Sellable Products: ${stats.sellableCount || 0}
- New Winners (<12 months): ${stats.newWinners || 0}
- Sponsored %: ${stats.sponsoredPct?.toFixed(0) || 0}%

**Top Products (by opportunity score):**
${productSummary}

Provide your analysis in the following JSON structure (no markdown, just valid JSON):
{
  "verdict": "A 2-3 sentence market entry recommendation",
  "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
  "risks": ["risk 1", "risk 2", "risk 3"],
  "pricingStrategy": "Recommended pricing strategy in INR with specific price range",
  "keywordStrategy": "Top keyword approach recommendation",
  "differentiators": ["differentiator 1", "differentiator 2", "differentiator 3"],
  "estimatedTimeToProfit": "Estimated months to break even with reasoning",
  "competitiveAdvantage": "How to build a sustainable competitive advantage in this niche"
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0]?.text || '';

  try {
    // Extract JSON from response (handle possible markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('AI parse error:', e.message);
  }

  // Fallback: return raw text as verdict
  return { verdict: text, opportunities: [], risks: [] };
}

/**
 * Analyze a specific product deeply
 */
async function getProductAnalysis(product, competitors) {
  const client = getClient();
  if (!client) return null;

  const compSummary = (competitors || []).slice(0, 10).map(c =>
    `- ${(c.title || '').slice(0, 50)} | ₹${c.price} | Rev: ₹${c.monthly_revenue}/mo | Reviews: ${c.reviews} | Moat: ${c.moat_score}`
  ).join('\n');

  const prompt = `You are an expert Amazon India FBA product analyst. Analyze this specific product opportunity against its competitors.

**Target Product:**
- Title: ${product.title}
- ASIN: ${product.asin}
- Price: ₹${product.price}
- Monthly Revenue: ₹${product.monthly_revenue}
- Monthly Sales: ${product.monthly_sales}
- Reviews: ${product.reviews} (Rating: ${product.rating})
- Opportunity Score: ${product.opportunity_score}/100
- Moat Score: ${product.moat_score}/100
- Verdict: ${product.verdict}

**Competitors:**
${compSummary || 'No competitor data available'}

Provide your analysis as valid JSON (no markdown):
{
  "recommendation": "BUY, WATCH, or SKIP with 2-3 sentence justification",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "entryStrategy": "Specific strategy to enter this market segment",
  "suggestedPrice": "Recommended price point in INR with reasoning",
  "expectedMonthlyProfit": "Estimated monthly profit range in INR",
  "riskLevel": "LOW, MEDIUM, or HIGH with explanation"
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1200,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0]?.text || '';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('AI parse error:', e.message);
  }

  return { recommendation: text, strengths: [], weaknesses: [] };
}

module.exports = { getMarketInsights, getProductAnalysis };
