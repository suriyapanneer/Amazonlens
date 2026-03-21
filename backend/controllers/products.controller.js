const db = require('../db/queries');

async function getProducts(req, res) {
  try {
    const products = await db.getAllProducts(req.user.id);
    const parsed = products.map(p => ({
      ...p,
      costs: p.costs_json || null,
    }));
    res.json({ success: true, products: parsed, total: parsed.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function getSellable(req, res) {
  try {
    const products = await db.getSellableProducts(req.user.id);
    const parsed = products.map(p => ({
      ...p,
      costs: p.costs_json || null,
    }));
    res.json({ success: true, products: parsed, total: parsed.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function deleteProduct(req, res) {
  try {
    await db.deleteProduct(req.user.id, req.params.asin);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { getProducts, getSellable, deleteProduct };
