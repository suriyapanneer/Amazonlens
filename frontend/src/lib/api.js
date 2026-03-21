import { supabase } from './supabase';

const BASE = import.meta.env.VITE_API_URL || '/api';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

async function req(path, opts = {}) {
  const authHeaders = await getAuthHeaders();
  const r = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { ...authHeaders, ...(opts.headers || {}) },
  });
  const d = await r.json();
  if (!d.success && r.status >= 400) throw new Error(d.error || 'API error');
  return d;
}

async function up(path, file, params = {}) {
  const authHeaders = await getAuthHeaders();
  const f = new FormData();
  f.append('file', file);
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${BASE}${path}${qs ? '?' + qs : ''}`, {
    method: 'POST',
    body: f,
    headers: authHeaders,
  });
  const d = await r.json();
  if (!d.success) throw new Error(d.error || 'Upload error');
  return d;
}

export const api = {
  uploadXray: (file) => up('/upload/xray', file),
  uploadCerebro: (file, asin) => up('/upload/cerebro', file, asin ? { asin } : {}),
  uploadBlackBox: (file) => up('/upload/blackbox', file),
  getProducts: () => req('/products'),
  getSellable: () => req('/products/sellable'),
  deleteProduct: (asin) => req(`/products/${asin}`, { method: 'DELETE' }),
  compare: (asins) => req('/products/compare', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ asins }) }),
  calcProfit: (costs) => req('/calculate/profit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(costs) }),
  analyze: (payload) => req('/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  getReports: () => req('/reports'),
  generateReport: (data) => req('/reports/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  getMarketInsights: (data) => req('/ai/market-insights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  getProductAnalysis: (data) => req('/ai/product-analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  deleteReport: (id) => req(`/reports/${id}`, { method: 'DELETE' }),
  getStorageOverview: () => req('/storage'),
  deleteStorageData: (data) => req('/storage/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  getMe: () => req('/auth/me'),
};
