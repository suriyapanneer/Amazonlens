const { parseCSV, mapXray, mapCerebro, mapBlackBox } = require('../services/csv-mappers');
const { moatScore, opportunityScore, keywordTier, isSellable, marketOpportunityScore } = require('../services/scoring');
const { estimateProfitFromProduct } = require('../services/fees');
const db = require('../db/queries');

async function processAndSave(userId, products, source, totalRevenue) {
  let saved = 0, updated = 0;

  for (const p of products) {
    if (!p.asin && !p.title) continue;
    const oScore  = opportunityScore(p);
    const mScore  = moatScore(p, totalRevenue || p.revenue * 10);
    const profEst = estimateProfitFromProduct(p);
    const sellable = isSellable(p, oScore);
    const verdict  = oScore >= 70 ? 'ENTER' : oScore >= 45 ? 'WATCH' : 'SKIP';

    const existing = await db.getByAsin(userId, p.asin);
    await db.upsertProduct(userId, {
      asin: p.asin || `gen_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      title: p.title, brand: p.brand,
      category: p.category || '',
      price: p.price, monthly_sales: p.sales || 0,
      monthly_revenue: p.revenue || 0,
      bsr: p.bsr || 0, reviews: p.reviews, rating: p.rating,
      review_vel: p.reviewVel || 0,
      fulfillment: p.fulfillment || '', seller_age: p.sellerAge || 0,
      weight: p.weight || 0, images: p.images || 0,
      active_sellers: p.activeSellers || 0,
      sponsored: p.sponsored || false,
      url: p.url || '',
      moat_score: mScore, opportunity_score: oScore,
      profit_estimate: profEst.profit, margin_estimate: profEst.margin,
      sellable, verdict, source,
    });
    existing ? updated++ : saved++;
  }
  return { saved, updated };
}

async function uploadXray(req, res) {
  try {
    const userId = req.user.id;
    const raw = parseCSV(req.file.buffer);
    const products = raw.map(mapXray).filter(p => p.asin || p.title);
    const totalRev = products.reduce((a, p) => a + p.revenue, 0);

    const avgPrice    = products.reduce((a, p) => a + p.price, 0) / (products.length || 1);
    const avgReviews  = products.reduce((a, p) => a + p.reviews, 0) / (products.length || 1);
    const avgRating   = products.filter(p => p.rating > 0).reduce((a, p) => a + p.rating, 0) / (products.filter(p => p.rating > 0).length || 1);
    const sponsoredPct = (products.filter(p => p.sponsored).length / products.length) * 100;
    const fbaCount    = products.filter(p => p.fulfillment?.toUpperCase().includes('FBA')).length;
    const newWinners  = products.filter(p => p.sellerAge > 0 && p.sellerAge <= 12 && p.revenue >= 150000).length;

    const brandMap = {};
    products.forEach(p => {
      const b = p.brand || 'Unknown';
      if (!brandMap[b]) brandMap[b] = { name: b, revenue: 0, units: 0 };
      brandMap[b].revenue += p.revenue;
      brandMap[b].units += p.sales;
    });
    const topSellers = Object.values(brandMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(s => ({ ...s, share: parseFloat(((s.revenue / totalRev) * 100).toFixed(1)) }));

    const { saved, updated } = await processAndSave(userId, products, 'xray', totalRev);

    const productsEnriched = products.map(p => {
      const oScore = opportunityScore(p);
      return {
        ...p,
        revenueShare: parseFloat(((p.revenue / (totalRev || 1)) * 100).toFixed(1)),
        moatScore: moatScore(p, totalRev),
        opportunityScore: oScore,
        verdict: oScore >= 70 ? 'ENTER' : oScore >= 45 ? 'WATCH' : 'SKIP',
      };
    }).sort((a, b) => b.revenue - a.revenue);

    const stats = {
      totalRevenue: totalRev, totalUnits: products.reduce((a, p) => a + p.sales, 0),
      avgPrice, avgReviews, avgRating, sponsoredPct, fbaCount, newWinners, totalProducts: products.length,
    };
    const totalOppScore = marketOpportunityScore(stats, null);

    res.json({
      success: true, products: productsEnriched, stats, topSellers,
      opportunityScore: totalOppScore,
      verdict: totalOppScore >= 70 ? 'ENTER' : totalOppScore >= 45 ? 'WATCH' : 'SKIP',
      db: { saved, updated },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}

async function uploadCerebro(req, res) {
  try {
    const userId = req.user.id;
    const { asin } = req.query;
    const raw = parseCSV(req.file.buffer);
    const keywords = raw.map(mapCerebro)
      .filter(k => k.keyword && k.searchVol > 0)
      .map(k => ({ ...k, tier: keywordTier(k) }))
      .sort((a, b) => b.searchVol - a.searchVol);

    const tiers = {
      ZERO_COMP: keywords.filter(k => k.tier === 'ZERO_COMP'),
      GOLD:      keywords.filter(k => k.tier === 'GOLD'),
      SILVER:    keywords.filter(k => k.tier === 'SILVER'),
      BRONZE:    keywords.filter(k => k.tier === 'BRONZE'),
    };
    const trending = keywords.filter(k => k.trend >= 20).sort((a, b) => b.trend - a.trend).slice(0, 15);

    if (asin) {
      await db.updateKeywords(userId, asin, {
        top_keyword: keywords[0]?.keyword || '',
        keyword_count: keywords.length,
        zero_comp_keywords: tiers.ZERO_COMP.length,
        gold_keywords: tiers.GOLD.length,
      });
      // Also save individual keyword rows
      await db.upsertKeywordRows(userId, asin, keywords.slice(0, 100));
    }

    res.json({ success: true, keywords, tiers, trending, total: keywords.length, linkedAsin: asin || null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function uploadBlackBox(req, res) {
  try {
    const userId = req.user.id;
    const raw = parseCSV(req.file.buffer);
    const products = raw.map(mapBlackBox).filter(p => p.asin || p.title);
    const totalRev = products.reduce((a, p) => a + p.revenue, 0);
    const { saved, updated } = await processAndSave(userId, products, 'blackbox', totalRev);

    for (const p of products) {
      if (p.asin) {
        await db.updateBlackBox(userId, p.asin, {
          bb_category: p.category || '',
          bb_net_margin: p.netMargin || 0,
          bb_opportunity_score: opportunityScore(p),
        });
      }
    }

    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const avgNetMargin = products.filter(p => p.netMargin > 0).reduce((a, p) => a + p.netMargin, 0) / (products.filter(p => p.netMargin > 0).length || 1);

    res.json({ success: true, total: products.length, categories, avgNetMargin: parseFloat(avgNetMargin.toFixed(1)), db: { saved, updated } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}

module.exports = { uploadXray, uploadCerebro, uploadBlackBox };
