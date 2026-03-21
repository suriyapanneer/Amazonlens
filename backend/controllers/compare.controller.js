const db = require('../db/queries');
const { calcProfit, estimateProfitFromProduct } = require('../services/fees');

async function compareProducts(req, res) {
  try {
    const { asins } = req.body;
    if (!Array.isArray(asins) || asins.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 ASINs' });
    }

    const rawProducts = await db.getByAsins(req.user.id, asins);
    const products = rawProducts.map(p => {
      const costs = p.costs_json || null;
      const profitCalc = costs ? calcProfit(costs) : estimateProfitFromProduct(p);
      return { ...p, costs, profitCalc };
    }).filter(Boolean);

    const fields = [
      { key: 'monthly_revenue', label: 'Revenue/mo', format: 'inr' },
      { key: 'monthly_sales',   label: 'Units/mo',   format: 'num' },
      { key: 'price',           label: 'Price',       format: 'inr' },
      { key: 'reviews',         label: 'Reviews',     format: 'num' },
      { key: 'rating',          label: 'Rating',      format: 'dec' },
      { key: 'moat_score',      label: 'Moat Score',  format: 'num', lowerIsBetter: true },
      { key: 'opportunity_score', label: 'Opp Score', format: 'num' },
      { key: 'profit_estimate', label: 'Est. Profit', format: 'inr' },
      { key: 'margin_estimate', label: 'Est. Margin', format: 'pct' },
      { key: 'weight',          label: 'Weight (kg)', format: 'dec', lowerIsBetter: true },
      { key: 'seller_age',      label: 'Seller Age (mo)', format: 'num', lowerIsBetter: true },
      { key: 'zero_comp_keywords', label: 'Zero Comp KWs', format: 'num' },
      { key: 'gold_keywords',   label: 'Gold KWs',    format: 'num' },
    ];

    const matrix = fields.map(f => ({
      ...f,
      values: products.map(p => ({
        asin: p.asin, title: p.title, value: p[f.key] || 0,
      })),
    }));

    matrix.forEach(f => {
      const vals = f.values.map(v => v.value);
      const best = f.lowerIsBetter ? Math.min(...vals) : Math.max(...vals);
      f.values.forEach(v => { v.isWinner = v.value === best; });
    });

    const winCounts = {};
    asins.forEach(a => { winCounts[a] = 0; });
    matrix.forEach(f => f.values.filter(v => v.isWinner).forEach(v => {
      winCounts[v.asin] = (winCounts[v.asin] || 0) + 1;
    }));

    res.json({ success: true, products, matrix, winCounts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { compareProducts };
