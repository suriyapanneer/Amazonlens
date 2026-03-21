const { calcProfit } = require('../services/fees');
const { buildForecast, marketOpportunityScore } = require('../services/scoring');

async function analyze(req, res) {
  try {
    const { stats, costs } = req.body;
    const oppScore = marketOpportunityScore(stats, costs);
    const verdict  = oppScore >= 70 ? 'ENTER' : oppScore >= 45 ? 'WATCH' : 'SKIP';
    const pc       = costs ? calcProfit(costs) : null;
    const forecast = pc ? buildForecast(stats.totalRevenue, costs.sellPrice, pc.profit) : [];

    const reasons = [];
    if (stats.avgReviews < 300)  reasons.push(`Low avg reviews (${Math.round(stats.avgReviews)}) — easy to compete early`);
    if (stats.newWinners >= 2)   reasons.push(`${stats.newWinners} new sellers (<12mo) already winning`);
    if (stats.sponsoredPct < 30) reasons.push(`Only ${Math.round(stats.sponsoredPct)}% products sponsored — organic traffic available`);
    if (costs?.sellPrice < 1000) reasons.push('Under ₹1,000 price = 0% Amazon referral fee advantage');
    if (pc?.margin > 35)         reasons.push(`Strong net margin: ${pc.margin}%`);

    res.json({ success: true, opportunityScore: oppScore, verdict, profitCalc: pc, forecast, reasons });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

module.exports = { analyze };
