const db = require('../db/queries');
const aiService = require('../services/ai');

async function getMarketInsights(req, res) {
  try {
    const userId = req.user.id;
    const products = await db.getAllProducts(userId);

    if (!products.length) {
      return res.json({
        success: true,
        message: 'No products found. Upload Helium 10 data first.',
        insights: null,
      });
    }

    // Compute market stats
    const totalRevenue = products.reduce((a, p) => a + (p.monthly_revenue || 0), 0);
    const stats = {
      totalProducts: products.length,
      totalRevenue,
      avgPrice: products.reduce((a, p) => a + (p.price || 0), 0) / products.length,
      avgReviews: products.reduce((a, p) => a + (p.reviews || 0), 0) / products.length,
      avgRating: products.reduce((a, p) => a + (p.rating || 0), 0) / products.length,
      sellableCount: products.filter(p => p.sellable).length,
      newWinners: products.filter(p => p.seller_age > 0 && p.seller_age <= 12 && p.monthly_revenue >= 100000).length,
      sponsoredPct: (products.filter(p => p.sponsored).length / products.length) * 100,
    };

    const insights = await aiService.getMarketInsights(products, stats);

    if (!insights) {
      return res.json({
        success: true,
        message: 'AI insights require CLAUDE_API_KEY or ANTHROPIC_API_KEY in your .env file.',
        insights: null,
      });
    }

    res.json({ success: true, insights });
  } catch (e) {
    console.error('AI insights error:', e);
    res.status(500).json({ error: e.message });
  }
}

async function getProductAnalysis(req, res) {
  try {
    const userId = req.user.id;
    const { asin } = req.body;

    if (!asin) {
      return res.status(400).json({ error: 'ASIN required' });
    }

    const product = await db.getByAsin(userId, asin);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get other products as competitors
    const allProducts = await db.getAllProducts(userId);
    const competitors = allProducts.filter(p => p.asin !== asin);

    const analysis = await aiService.getProductAnalysis(product, competitors);

    if (!analysis) {
      return res.json({
        success: true,
        message: 'AI analysis requires CLAUDE_API_KEY or ANTHROPIC_API_KEY in your .env file.',
        analysis: null,
      });
    }

    res.json({ success: true, analysis });
  } catch (e) {
    console.error('AI analysis error:', e);
    res.status(500).json({ error: e.message });
  }
}

module.exports = { getMarketInsights, getProductAnalysis };
