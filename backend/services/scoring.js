/**
 * Scoring engines — preserved verbatim from server.js v3
 */

function moatScore(p, totalRevenue) {
  let s = 0;
  if (p.reviews < 50)        s += 28;
  else if (p.reviews < 200)  s += 20;
  else if (p.reviews < 500)  s += 10;
  else if (p.reviews < 1000) s += 4;
  if (p.rating >= 4.5)       s += 20;
  else if (p.rating >= 4.0)  s += 14;
  else if (p.rating >= 3.5)  s += 7;
  if (p.sellerAge > 60)      s += 18;
  else if (p.sellerAge > 24) s += 12;
  else if (p.sellerAge > 12) s += 6;
  if (String(p.fulfillment||'').toUpperCase().includes('FBA')) s += 12;
  const share = (p.revenue / (totalRevenue || 1)) * 100;
  s += Math.min(22, Math.round(share / 2));
  return Math.min(100, Math.round(s));
}

function keywordTier(k) {
  if (k.competing === 0 && k.searchVol >= 500)  return 'ZERO_COMP';
  if (k.iqScore >= 2000 && k.searchVol >= 2000) return 'GOLD';
  if (k.iqScore >= 800  && k.searchVol >= 800)  return 'SILVER';
  if (k.searchVol >= 200)                        return 'BRONZE';
  return 'SKIP';
}

function opportunityScore(p, keywords = []) {
  let s = 0;
  if (p.revenue >= 500000)     s += 14;
  else if (p.revenue >= 200000) s += 10;
  else if (p.revenue >= 50000)  s += 5;
  if (p.reviews < 100)       s += 15;
  else if (p.reviews < 300)  s += 12;
  else if (p.reviews < 500)  s += 7;
  else if (p.reviews < 1000) s += 2;
  if (p.rating < 3.5)      s += 12;
  else if (p.rating < 4.0) s += 8;
  else if (p.rating < 4.3) s += 4;
  if (p.price < 500)        s += 14;
  else if (p.price < 1000)  s += 11;
  else if (p.price < 2000)  s += 5;
  if (p.weight === 0 || p.weight < 0.5)  s += 12;
  else if (p.weight < 1.0)              s += 8;
  else if (p.weight < 2.0)              s += 4;
  const zc = keywords.filter(k => k.tier === 'ZERO_COMP').length;
  const gl = keywords.filter(k => k.tier === 'GOLD').length;
  if (zc >= 3)      s += 10;
  else if (zc >= 1) s += 7;
  if (gl >= 3)      s += 8;
  else if (gl >= 1) s += 4;
  if (p.sellerAge > 0 && p.sellerAge <= 12 && p.revenue >= 100000) s += 5;
  return Math.min(100, Math.round(s));
}

function isSellable(p, oppScore) {
  return (
    oppScore >= 55 &&
    p.price >= 200 && p.price <= 2000 &&
    p.reviews < 600 &&
    p.revenue >= 30000 &&
    (p.weight === 0 || p.weight <= 2.0)
  );
}

function buildForecast(totalRevenue, sellPrice, profitPerUnit) {
  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const factor = m <= 3 ? 1.50 : m <= 6 ? 1.28 : 1.12;
    const share  = Math.min(0.18, 0.012 * Math.pow(factor, m - 1));
    const rev    = Math.round(totalRevenue * share);
    const units  = sellPrice > 0 ? Math.round(rev / sellPrice) : 0;
    return { month: m, revenue: rev, units, profit: Math.round(units * profitPerUnit) };
  });
}

function marketOpportunityScore(stats, costs) {
  let oppScore = 0;
  if (stats.totalRevenue >= 10000000) oppScore += 14;
  else if (stats.totalRevenue >= 5000000) oppScore += 11;
  else if (stats.totalRevenue >= 2000000) oppScore += 7;
  else if (stats.totalRevenue >= 500000) oppScore += 3;
  if (stats.avgReviews < 100) oppScore += 15;
  else if (stats.avgReviews < 300) oppScore += 12;
  else if (stats.avgReviews < 500) oppScore += 7;
  else if (stats.avgReviews < 1000) oppScore += 2;
  if (stats.newWinners >= 3) oppScore += 15;
  else if (stats.newWinners >= 2) oppScore += 10;
  else if (stats.newWinners >= 1) oppScore += 5;
  if (stats.avgPrice < 500) oppScore += 14;
  else if (stats.avgPrice < 1000) oppScore += 11;
  else if (stats.avgPrice < 2000) oppScore += 5;
  if (stats.sponsoredPct < 15) oppScore += 14;
  else if (stats.sponsoredPct < 30) oppScore += 9;
  else if (stats.sponsoredPct < 50) oppScore += 4;
  if (costs) {
    const m = (costs.sellPrice - costs.cogs - costs.packaging - costs.shipping) / (costs.sellPrice || 1);
    if (m >= 0.5) oppScore += 14;
    else if (m >= 0.35) oppScore += 10;
    else if (m >= 0.2) oppScore += 5;
  } else {
    oppScore += 8;
  }
  if (stats.avgRating < 3.5) oppScore += 14;
  else if (stats.avgRating < 4.0) oppScore += 9;
  else if (stats.avgRating < 4.3) oppScore += 4;
  return Math.min(100, Math.round(oppScore));
}

module.exports = {
  moatScore,
  keywordTier,
  opportunityScore,
  isSellable,
  buildForecast,
  marketOpportunityScore,
};
