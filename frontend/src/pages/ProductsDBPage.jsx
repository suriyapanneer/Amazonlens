import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { fmtINR, fmtNum, vColor, vBg } from '../lib/format';
import { exportProductsCSV } from '../lib/export';
import ScorePill from '../components/data-display/ScorePill';

const SkeletonRow = () => (
  <tr>
    {Array(12).fill(0).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className={`shimmer-row h-3.5 rounded ${i === 1 ? 'w-4/5' : 'w-3/5'}`} />
      </td>
    ))}
  </tr>
);

export default function ProductsDBPage({ onCompare }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sortF, setSortF] = useState('opportunity_score');
  const [sortD, setSortD] = useState('desc');
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const r = await api.getProducts(); setProducts(r.products || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleSel = asin => setSelected(s => { const n = new Set(s); n.has(asin) ? n.delete(asin) : n.size < 5 && n.add(asin); return n; });

  let rows = [...products];
  if (filter === 'SELLABLE') rows = rows.filter(p => p.sellable === 1);
  if (filter === 'ENTER')    rows = rows.filter(p => p.verdict === 'ENTER');
  if (filter === 'WATCH')    rows = rows.filter(p => p.verdict === 'WATCH');
  if (search) rows = rows.filter(p => (p.title + p.brand + p.asin + (p.category||'')).toLowerCase().includes(search.toLowerCase()));
  rows.sort((a, b) => { const va = a[sortF]??0, vb = b[sortF]??0; return sortD === 'asc' ? (va>vb?1:-1) : (va<vb?1:-1); });

  const counts = { all: products.length, sellable: products.filter(p => p.sellable).length, enter: products.filter(p => p.verdict === 'ENTER').length, watch: products.filter(p => p.verdict === 'WATCH').length };

  const SUMMARY_CARDS = [
    { l: 'All Products', v: counts.all, c: 'var(--sky)', f: 'ALL' },
    { l: '\uD83C\uDFAF Sellable', v: counts.sellable, c: 'var(--green)', f: 'SELLABLE' },
    { l: '\u2705 Enter', v: counts.enter, c: 'var(--green)', f: 'ENTER' },
    { l: '\u26A0\uFE0F Watch', v: counts.watch, c: 'var(--amber)', f: 'WATCH' },
  ];

  return (
    <div className="page-container">
      {/* ─── Page Header ─── */}
      <div className="page-header animate-fade-up">
        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <div className="page-subtitle">Products Database</div>
            <h1 className="page-title text-xl sm:text-2xl lg:text-[28px]">Saved Products</h1>
          </div>
          <div className="flex gap-3 flex-wrap">
            {selected.size >= 2 && (
              <button className="btn btn-amber" onClick={() => onCompare(Array.from(selected))}>&#x26A1; Compare {selected.size}</button>
            )}
            <button className="btn btn-outline text-xs" onClick={() => exportProductsCSV(rows)}>&darr; Export CSV</button>
            <button className="btn btn-outline text-xs" onClick={load}>↻ Refresh</button>
          </div>
        </div>
      </div>

      {/* ─── Summary Cards ─── */}
      <div className="page-section-lg">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {SUMMARY_CARDS.map((item, i) => (
            <div
              key={item.f}
              className="stat-card animate-fade-up cursor-pointer"
              onClick={() => setFilter(f => f === item.f ? 'ALL' : item.f)}
              style={{
                borderColor: filter === item.f ? `${item.c}40` : undefined,
                background: filter === item.f ? `${item.c}0a` : undefined,
                boxShadow: filter === item.f ? `0 6px 24px ${item.c}18` : undefined,
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[14px]" style={{ background: item.c, opacity: filter === item.f ? 1 : 0.3 }} />
              <div className="font-mono text-2xl sm:text-3xl lg:text-[34px] font-medium leading-none mb-2" style={{ color: item.c }}>{item.v}</div>
              <div className="text-[13px] text-[var(--sub)] font-medium">{item.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Compare Selection Bar ─── */}
      {selected.size > 0 && (
        <div className="animate-fade-up rounded-xl px-6 py-4 mb-6 flex justify-between items-center gap-4 flex-wrap"
          style={{ background: 'rgba(201,122,0,.06)', border: '1px solid rgba(201,122,0,.2)', boxShadow: '0 4px 20px rgba(201,122,0,.08)' }}>
          <span className="text-sm text-[var(--amber)] font-semibold">
            &#x2713; {selected.size} selected{selected.size < 2 ? ' \u2014 pick 1 more to compare' : ''}
          </span>
          <div className="flex gap-3">
            {selected.size >= 2 && (
              <button className="btn btn-amber px-5 py-2 text-xs" onClick={() => onCompare(Array.from(selected))}>Compare &rarr;</button>
            )}
            <button className="btn btn-outline px-4 py-2 text-xs" onClick={() => setSelected(new Set())}>Clear</button>
          </div>
        </div>
      )}

      {/* ─── Search & Filters ─── */}
      <div className="filter-bar animate-fade-up" style={{ animationDelay: '120ms' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products, brands, ASINs\u2026"
          className="flex-1 min-w-0 sm:min-w-[220px] bg-[var(--surface)] border border-[var(--border2)] text-[var(--ink)] px-4 py-2.5 rounded-lg text-[13px] outline-none focus:border-[rgba(240,160,48,.4)] focus:shadow-[0_0_0_3px_rgba(240,160,48,.1)] transition-all"
        />
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'SELLABLE', 'ENTER', 'WATCH'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn px-4 py-2 text-[11px] ${filter === f ? 'tab-active' : 'btn-outline'}`}
            >
              {f === 'SELLABLE' ? '\uD83C\uDFAF Sellable' : f}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Data Table ─── */}
      <div className="table-wrapper animate-fade-up" style={{ animationDelay: '180ms' }}>
        {rows.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">&#x1F4ED;</div>
            <div className="empty-title">
              {products.length === 0 ? 'No products saved yet' : 'No products match filter'}
            </div>
            <p className="empty-desc">
              {products.length === 0 ? 'Upload an Xray or Black Box CSV to get started.' : 'Try adjusting your search or removing filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[700px]">
              <thead>
                <tr>
                  <th className="w-10 px-4">
                    <input
                      type="checkbox"
                      onChange={e => e.target.checked ? setSelected(new Set(rows.slice(0, 5).map(p => p.asin))) : setSelected(new Set())}
                    />
                  </th>
                  {[
                    { label: 'Product', field: 'title' },
                    { label: 'Price', field: 'price' },
                    { label: 'Revenue/mo', field: 'monthly_revenue' },
                    { label: 'Sales/mo', field: 'monthly_sales' },
                    { label: 'Reviews', field: 'reviews' },
                    { label: 'Rating', field: 'rating' },
                    { label: 'Opp Score', field: 'opportunity_score' },
                    { label: 'Est. Profit', field: 'profit_estimate' },
                  ].map(({ label, field }) => (
                    <th
                      key={label}
                      onClick={() => { setSortF(field); setSortD(d => sortF === field ? (d === 'asc' ? 'desc' : 'asc') : 'desc'); }}
                      className="cursor-pointer select-none hover:text-[var(--ink)]"
                    >
                      {label}{sortF === field ? (sortD === 'asc' ? ' \u2191' : ' \u2193') : ''}
                    </th>
                  ))}
                  <th>Sellable</th>
                  <th>Source</th>
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody>
                {loading ? Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />) : rows.map((p) => {
                  const sel = selected.has(p.asin);
                  return (
                    <tr
                      key={p.asin}
                      style={{
                        background: sel ? 'rgba(201,122,0,.05)' : p.sellable ? 'rgba(10,122,74,.025)' : 'transparent',
                      }}
                    >
                      <td className="px-4">
                        <input type="checkbox" checked={sel} onChange={() => toggleSel(p.asin)} disabled={!sel && selected.size >= 5} />
                      </td>
                      <td className="max-w-[160px] sm:max-w-[240px]">
                        <div className="font-semibold text-[var(--ink2)] truncate text-[13px]" title={p.title}>{p.title || '\u2014'}</div>
                        <div className="text-[11px] text-[var(--sub)] mt-1">{p.brand} &middot; <span className="font-mono">{p.asin}</span></div>
                      </td>
                      <td className="font-mono text-[var(--amber)] font-semibold">{fmtINR(p.price)}</td>
                      <td className="font-mono text-[var(--green)] font-semibold">{fmtINR(p.monthly_revenue)}</td>
                      <td className="font-mono text-[var(--sky)]">{fmtNum(p.monthly_sales)}</td>
                      <td className="font-mono">{fmtNum(p.reviews)}</td>
                      <td className="font-mono">{p.rating > 0 ? p.rating.toFixed(1) + '\u2B50' : '\u2014'}</td>
                      <td><ScorePill score={p.opportunity_score} verdict={p.verdict} /></td>
                      <td className="font-mono font-semibold" style={{ color: p.profit_estimate > 0 ? 'var(--green)' : 'var(--red)' }}>
                        {fmtINR(p.profit_estimate)}
                      </td>
                      <td className="text-center">
                        {p.sellable ? '\uD83C\uDFAF' : <span className="text-[var(--muted)] text-[11px]">&mdash;</span>}
                      </td>
                      <td>
                        <span className={`badge font-mono text-[9px] ${p.source === 'blackbox' ? 'badge-green' : p.source === 'cerebro' ? 'badge-sky' : 'badge-amber'}`}>
                          {p.source}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={async () => { if (!confirm('Delete?')) return; setDeleting(p.asin); await api.deleteProduct(p.asin); await load(); setDeleting(null); setSelected(s => { const n = new Set(s); n.delete(p.asin); return n; }); }}
                          disabled={deleting === p.asin}
                          className="btn btn-outline px-3 py-1 text-[11px] text-[var(--red)] border-[rgba(192,37,53,.25)]"
                        >
                          {deleting === p.asin ? '\u2026' : '\uD83D\uDDD1'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">
          <span>Showing {rows.length} of {products.length} products</span>
          <span>&#x1F3AF; = Sellable &middot; Select up to 5 to compare</span>
        </div>
      </div>
    </div>
  );
}
