const express = require('express');
const cors    = require('cors');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Core middleware ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── Health routes (no auth required) ─────────────────────────────────────────
app.get('/', (_req, res) => res.json({ status: 'AmazonLens API v4' }));
app.get('/health', async (_req, res) => {
  try {
    const { supabase } = require('./config/supabase');
    const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
    res.json({ ok: true, products: count || 0 });
  } catch {
    res.json({ ok: true, products: 0 });
  }
});

// ── API routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/upload',    require('./routes/upload.routes'));
app.use('/api/products',  require('./routes/products.routes'));
app.use('/api/products/compare', require('./routes/compare.routes'));
app.use('/api/calculate/profit', require('./routes/profit.routes'));
app.use('/api/analyze',   require('./routes/analyze.routes'));
app.use('/api/reports',   require('./routes/reports.routes'));
app.use('/api/ai',        require('./routes/ai.routes'));
app.use('/api/storage',   require('./routes/storage.routes'));

// ── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
