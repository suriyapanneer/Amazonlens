const db = require('../db/queries');
const { calcProfit } = require('../services/fees');

async function calculateProfit(req, res) {
  try {
    const { asin, ...costs } = req.body;
    const result = calcProfit(costs);

    if (asin) {
      await db.updateCosts(req.user.id, asin, costs, result.profit, result.margin);
    }

    res.json({ success: true, ...result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

module.exports = { calculateProfit };
