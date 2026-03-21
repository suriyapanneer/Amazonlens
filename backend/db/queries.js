/**
 * Supabase query layer — replaces the JSON file-based db.js
 */

const { supabase } = require('../config/supabase');

// ── Products ──────────────────────────────────────────────────────────────────

async function upsertProduct(userId, data) {
  const now = new Date().toISOString();
  const asin = data.asin || `gen_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const row = {
    user_id: userId,
    asin,
    title: data.title || '',
    brand: data.brand || 'Unknown',
    category: data.category || '',
    price: data.price || 0,
    monthly_sales: data.monthly_sales || 0,
    monthly_revenue: data.monthly_revenue || 0,
    bsr: data.bsr || 0,
    reviews: data.reviews || 0,
    rating: data.rating || 0,
    review_vel: data.review_vel || 0,
    fulfillment: data.fulfillment || '',
    seller_age: data.seller_age || 0,
    weight: data.weight || 0,
    images: data.images || 0,
    active_sellers: data.active_sellers || 0,
    sponsored: data.sponsored || false,
    url: data.url || '',
    moat_score: data.moat_score || 0,
    opportunity_score: data.opportunity_score || 0,
    profit_estimate: data.profit_estimate || 0,
    margin_estimate: data.margin_estimate || 0,
    sellable: data.sellable || false,
    verdict: data.verdict || 'SKIP',
    source: data.source || '',
    updated_at: now,
  };

  const { data: result, error } = await supabase
    .from('products')
    .upsert(row, { onConflict: 'user_id,asin' })
    .select()
    .single();

  if (error) throw error;
  return result;
}

async function updateKeywords(userId, asin, keywordData) {
  const { error } = await supabase
    .from('products')
    .update({
      top_keyword: keywordData.top_keyword || '',
      keyword_count: keywordData.keyword_count || 0,
      zero_comp_keywords: keywordData.zero_comp_keywords || 0,
      gold_keywords: keywordData.gold_keywords || 0,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('asin', asin);

  if (error) throw error;
}

async function upsertKeywordRows(userId, asin, keywords) {
  // Get product ID
  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('user_id', userId)
    .eq('asin', asin)
    .single();

  const rows = keywords.map(k => ({
    user_id: userId,
    product_id: product?.id || null,
    asin,
    keyword: k.keyword,
    search_vol: k.searchVol || 0,
    iq_score: k.iqScore || 0,
    competing: k.competing || 0,
    trend: k.trend || 0,
    organic_rank: k.organicRank || 0,
    sponsored_rank: k.sponsoredRank || 0,
    tier: k.tier || 'SKIP',
  }));

  // Batch insert in chunks of 500
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error } = await supabase.from('keywords').insert(chunk);
    if (error) throw error;
  }
}

async function updateBlackBox(userId, asin, data) {
  const { error } = await supabase
    .from('products')
    .update({
      bb_category: data.bb_category || '',
      bb_net_margin: data.bb_net_margin || 0,
      bb_opportunity_score: data.bb_opportunity_score || 0,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('asin', asin);

  if (error) throw error;
}

async function updateCosts(userId, asin, costs, profitEstimate, marginEstimate) {
  const { error } = await supabase
    .from('products')
    .update({
      costs_json: costs,
      profit_estimate: profitEstimate,
      margin_estimate: marginEstimate,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('asin', asin);

  if (error) throw error;
}

async function getAllProducts(userId) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('monthly_revenue', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function getSellableProducts(userId) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .eq('sellable', true)
    .order('opportunity_score', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function getByAsin(userId, asin) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .eq('asin', asin)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data || null;
}

async function getByAsins(userId, asins) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .in('asin', asins);

  if (error) throw error;
  return data || [];
}

async function deleteProduct(userId, asin) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('user_id', userId)
    .eq('asin', asin);

  if (error) throw error;
}

async function countProducts(userId) {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) throw error;
  return count || 0;
}

// ── Analyses ──────────────────────────────────────────────────────────────────

async function saveAnalysis(userId, analysis) {
  const { data, error } = await supabase
    .from('analyses')
    .insert({
      user_id: userId,
      name: analysis.name || 'Market Analysis',
      stats_json: analysis.stats || null,
      costs_json: analysis.costs || null,
      opportunity_score: analysis.opportunityScore || 0,
      verdict: analysis.verdict || 'SKIP',
      forecast_json: analysis.forecast || null,
      reasons_json: analysis.reasons || null,
      ai_insights: analysis.aiInsights || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getAnalyses(userId) {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ── Reports ───────────────────────────────────────────────────────────────────

async function saveReport(userId, report) {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      user_id: userId,
      analysis_id: report.analysisId || null,
      title: report.title,
      report_type: report.reportType || 'market',
      pdf_url: report.pdfUrl || null,
      metadata_json: report.metadata || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getReports(userId) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ── Storage Management ───────────────────────────────────────────────────────

async function getStorageStats(userId) {
  const [products, keywords, analyses, reports] = await Promise.all([
    supabase.from('products').select('id,asin,title,source,created_at,updated_at', { count: 'exact' }).eq('user_id', userId),
    supabase.from('keywords').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('analyses').select('id,name,created_at', { count: 'exact' }).eq('user_id', userId),
    supabase.from('reports').select('id,title,report_type,pdf_url,created_at', { count: 'exact' }).eq('user_id', userId),
  ]);

  return {
    products: { count: products.count || 0, rows: products.data || [] },
    keywords: { count: keywords.count || 0 },
    analyses: { count: analyses.count || 0, rows: analyses.data || [] },
    reports: { count: reports.count || 0, rows: reports.data || [] },
  };
}

async function deleteAnalysis(userId, id) {
  const { error } = await supabase.from('analyses').delete().eq('user_id', userId).eq('id', id);
  if (error) throw error;
}

async function deleteReport(userId, id) {
  const { error } = await supabase.from('reports').delete().eq('user_id', userId).eq('id', id);
  if (error) throw error;
}

async function deleteKeywordsByAsin(userId, asin) {
  const { error } = await supabase.from('keywords').delete().eq('user_id', userId).eq('asin', asin);
  if (error) throw error;
}

async function deleteAllKeywords(userId) {
  const { error } = await supabase.from('keywords').delete().eq('user_id', userId);
  if (error) throw error;
}

async function deleteAllProducts(userId) {
  // Keywords have foreign key to products, delete them first
  await deleteAllKeywords(userId);
  const { error } = await supabase.from('products').delete().eq('user_id', userId);
  if (error) throw error;
}

async function deleteAllAnalyses(userId) {
  // Reports reference analyses, delete reports first
  const { error: re } = await supabase.from('reports').delete().eq('user_id', userId);
  if (re) throw re;
  const { error } = await supabase.from('analyses').delete().eq('user_id', userId);
  if (error) throw error;
}

async function deleteAllReports(userId) {
  const { error } = await supabase.from('reports').delete().eq('user_id', userId);
  if (error) throw error;
}

async function getOldProducts(userId, beforeDate) {
  const { data, error } = await supabase
    .from('products')
    .select('id,asin,title,updated_at')
    .eq('user_id', userId)
    .lt('updated_at', beforeDate)
    .order('updated_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

// ── Profiles ──────────────────────────────────────────────────────────────────

async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

module.exports = {
  upsertProduct,
  updateKeywords,
  upsertKeywordRows,
  updateBlackBox,
  updateCosts,
  getAllProducts,
  getSellableProducts,
  getByAsin,
  getByAsins,
  deleteProduct,
  countProducts,
  saveAnalysis,
  getAnalyses,
  saveReport,
  getReports,
  getProfile,
  getStorageStats,
  deleteAnalysis,
  deleteReport,
  deleteKeywordsByAsin,
  deleteAllKeywords,
  deleteAllProducts,
  deleteAllAnalyses,
  deleteAllReports,
  getOldProducts,
};
