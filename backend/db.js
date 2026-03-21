/**
 * AmazonLens DB — Pure JavaScript JSON store
 * No native deps, works on Node 18-25+, Windows/Mac/Linux
 * 
 * Data is kept in memory + flushed to db.json on every write.
 * Re-uploading the same ASIN does an upsert (update if exists, insert if new).
 */

const fs   = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'amazonlens-db.json');

// ── In-memory store ──────────────────────────────────────────────────────────
let store = {
  products: {},   // keyed by asin
  version:  3,
};

// ── Load from disk on startup ─────────────────────────────────────────────────
function load() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const data = JSON.parse(raw);
      store = { products: {}, version: 3, ...data };
      console.log(`📂 DB loaded: ${Object.keys(store.products).length} products`);
    } else {
      console.log('📂 DB: starting fresh');
    }
  } catch (e) {
    console.warn('⚠️  DB load failed, starting fresh:', e.message);
    store = { products: {}, version: 3 };
  }
}

// ── Flush to disk (async, non-blocking) ───────────────────────────────────────
let flushTimer = null;
function flush() {
  if (flushTimer) return; // debounce: one write per 300ms max
  flushTimer = setTimeout(() => {
    flushTimer = null;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf8');
    } catch (e) {
      console.error('⚠️  DB flush failed:', e.message);
    }
  }, 300);
}

// ── UPSERT product ────────────────────────────────────────────────────────────
function upsertProduct(p) {
  const now  = new Date().toISOString();
  const asin = p.asin || `gen_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
  const existing = store.products[asin];

  store.products[asin] = {
    // Keep fields that shouldn't be overwritten by a re-upload
    keywords_json:       existing?.keywords_json       ?? '[]',
    costs_json:          existing?.costs_json           ?? null,
    top_keyword:         existing?.top_keyword          ?? '',
    keyword_count:       existing?.keyword_count        ?? 0,
    zero_comp_keywords:  existing?.zero_comp_keywords   ?? 0,
    gold_keywords:       existing?.gold_keywords        ?? 0,
    bb_category:         existing?.bb_category          ?? '',
    bb_net_margin:       existing?.bb_net_margin        ?? 0,
    bb_opportunity_score:existing?.bb_opportunity_score ?? 0,
    created_at:          existing?.created_at           ?? now,

    // Always overwrite with latest values
    ...p,
    asin,
    updated_at: now,
  };

  flush();
  return existing ? 'updated' : 'saved';
}

// ── Update keywords for an ASIN ───────────────────────────────────────────────
function updateKeywords({ asin, keywords_json, top_keyword, keyword_count, zero_comp_keywords, gold_keywords }) {
  if (!store.products[asin]) return;
  Object.assign(store.products[asin], { keywords_json, top_keyword, keyword_count, zero_comp_keywords, gold_keywords, updated_at: new Date().toISOString() });
  flush();
}

// ── Update BlackBox fields ────────────────────────────────────────────────────
function updateBlackBox({ asin, bb_category, bb_net_margin, bb_opportunity_score }) {
  if (!store.products[asin]) return;
  Object.assign(store.products[asin], { bb_category, bb_net_margin, bb_opportunity_score, updated_at: new Date().toISOString() });
  flush();
}

// ── Update costs for an ASIN ──────────────────────────────────────────────────
function updateCosts({ asin, costs_json, profit_estimate, margin_estimate }) {
  if (!store.products[asin]) return;
  Object.assign(store.products[asin], { costs_json, profit_estimate, margin_estimate, updated_at: new Date().toISOString() });
  flush();
}

// ── Queries ───────────────────────────────────────────────────────────────────
function getAll() {
  return Object.values(store.products)
    .sort((a, b) => (b.monthly_revenue || 0) - (a.monthly_revenue || 0));
}

function getSellable() {
  return Object.values(store.products)
    .filter(p => p.sellable === 1)
    .sort((a, b) => (b.opportunity_score || 0) - (a.opportunity_score || 0));
}

function getByAsin(asin) {
  return store.products[asin] || null;
}

function getByAsins(asins) {
  return asins.map(a => store.products[a]).filter(Boolean);
}

function deleteProduct(asin) {
  delete store.products[asin];
  flush();
}

function countAll() {
  return Object.keys(store.products).length;
}

// ── Init ──────────────────────────────────────────────────────────────────────
load();

module.exports = {
  upsertProduct,
  updateKeywords,
  updateBlackBox,
  updateCosts,
  getAll,
  getSellable,
  getByAsin,
  getByAsins,
  deleteProduct,
  countAll,
};
