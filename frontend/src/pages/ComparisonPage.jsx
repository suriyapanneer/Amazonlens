import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { fmtINR, fmtNum, vColor, vBg } from '../lib/format';
import { exportCompareCSV } from '../lib/export';

const PALETTE = ['#c97a00','#0762b8','#0a7a4a','#c02535','#7040b0'];

const fmt = (v, f) => {
  if (v === null || v === undefined) return '\u2014';
  if (f === 'inr')  return fmtINR(v);
  if (f === 'num')  return fmtNum(v);
  if (f === 'pct')  return `${Number(v).toFixed(1)}%`;
  if (f === 'dec')  return Number(v).toFixed(1);
  return String(v);
};

export default function ComparisonPage({ asins, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!asins?.length) return;
    setLoading(true);
    api.compare(asins).then(setData).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [asins?.join(',')]);

  if (!asins?.length) return (
    <div className="text-center py-20 px-5">
      <div className="text-[40px] mb-3 animate-[float_3s_ease-in-out_infinite]">&#x26A1;</div>
      <div className="font-sora text-xl font-bold text-[var(--ink)] mb-2">No products selected</div>
      <p className="text-[var(--sub)] mb-5 text-sm">Go to Products DB, select 2&ndash;5 products, then compare.</p>
      <button className="btn btn-amber" onClick={onBack}>&larr; Products DB</button>
    </div>
  );

  if (loading) return (
    <div className="text-center py-20 px-5 text-[var(--sub)]">
      <div className="w-9 h-9 border-[3px] border-[var(--amber)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <div>Building comparison&hellip;</div>
    </div>
  );

  if (error) return <div className="text-center py-20 px-5 text-[var(--red)]">Error: {error}</div>;
  if (!data) return null;

  const { products, matrix, winCounts } = data;
  const winner = Object.entries(winCounts).sort((a, b) => b[1] - a[1])[0];
  const winnerProduct = products.find(p => p.asin === winner?.[0]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header animate-fade-up flex justify-between items-end flex-wrap gap-3">
        <div>
          <div className="page-subtitle">Side-by-Side Analysis</div>
          <h1 className="page-title">Comparing {products.length} Products</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline text-xs" onClick={() => exportCompareCSV(matrix, products)}>&darr; Export CSV</button>
          <button className="btn btn-outline text-xs" onClick={onBack}>&larr; Back to DB</button>
        </div>
      </div>

      {/* Winner banner */}
      <div className="page-section">
        {winnerProduct && (
          <div className="card animate-fade-up relative overflow-hidden"
            style={{
              padding: 24,
              background: 'linear-gradient(135deg,rgba(201,122,0,.06),rgba(201,122,0,.02))',
              border: '1px solid rgba(201,122,0,.2)',
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[14px]"
              style={{ background: 'linear-gradient(90deg,var(--amber),var(--amber2))' }}
            />
            <div className="flex items-center gap-5 flex-wrap">
              <div className="text-[32px] animate-[float_3s_ease-in-out_infinite]">&#x1F3C6;</div>
              <div className="flex-1">
                <div className="text-[11px] text-[var(--sub)] font-semibold mb-0.5">Overall Winner &mdash; {winner[1]} metrics won</div>
                <div className="font-sora text-lg font-bold text-[var(--amber)]">{winnerProduct.title?.slice(0, 70) || winnerProduct.asin}</div>
                <div className="text-xs text-[var(--sub)] mt-0.5">{winnerProduct.brand}</div>
              </div>
              <div className="flex gap-2.5">
                {products.map((p, i) => (
                  <div key={p.asin} className="text-center bg-[var(--surface)] rounded-[10px] px-3.5 py-2 shadow-[var(--sh1)]"
                    style={{ border: `1px solid ${PALETTE[i]}30` }}
                  >
                    <div className="font-mono text-xl font-semibold" style={{ color: PALETTE[i] }}>{winCounts[p.asin] || 0}</div>
                    <div className="text-[9px] text-[var(--sub)] uppercase tracking-wide">wins</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="section-divider" />

      {/* Product header cards */}
      <div className="page-section">
        <div className="overflow-x-auto">
          <div className="gap-3" style={{ display: 'grid', gridTemplateColumns: `repeat(${products.length},1fr)` }}>
          {products.map((p, i) => (
            <div key={p.asin} className="card animate-fade-up p-5 min-w-[200px]" style={{ borderTop: `3px solid ${PALETTE[i]}` }}>
              <div className="flex items-center gap-[7px] mb-2">
                <div
                  className="w-5 h-5 rounded-[5px] flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ background: PALETTE[i] }}
                >
                  {i + 1}
                </div>
                <span className="font-mono text-[9px] text-[var(--sub)]">{p.asin}</span>
              </div>
              <div className="text-xs font-bold text-[var(--ink2)] leading-snug mb-1.5">{p.title?.slice(0, 70)}</div>
              <div className="text-[11px] text-[var(--sub)] mb-2.5">{p.brand}</div>
              <div className="flex justify-between items-center">
                <span
                  className="badge text-[10px]"
                  style={{
                    background: vBg(p.verdict),
                    color: vColor(p.verdict),
                    border: `1px solid ${vColor(p.verdict)}25`,
                  }}
                >
                  {p.verdict} {p.opportunity_score}
                </span>
                <span className="font-mono text-[13px] font-semibold" style={{ color: PALETTE[i] }}>{fmtINR(p.monthly_revenue)}</span>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      <div className="section-divider" />

      {/* Comparison matrix */}
      <div className="page-section">
        <div className="card animate-fade-up overflow-hidden" style={{ animationDelay: '120ms' }}>
          <div className="px-5 py-3.5 border-b border-[var(--border)] flex justify-between items-center flex-wrap gap-3">
            <span className="font-mono text-[10px] text-[var(--sub)] tracking-[2px] uppercase">Metric Comparison Matrix</span>
            <span className="badge badge-muted text-[10px]">&#x1F3C6; = best value per metric</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px] min-w-[700px]">
              <thead>
                <tr className="bg-[var(--s2)] border-b border-[var(--border)]">
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] text-[var(--sub)] tracking-wider uppercase min-w-[160px] font-medium">Metric</th>
                  {products.map((p, i) => (
                    <th key={p.asin} className="px-4 py-2.5 text-center min-w-[130px]">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-3 h-3 rounded-[3px] shrink-0" style={{ background: PALETTE[i] }} />
                        <span className="text-[11px] font-semibold text-[var(--ink2)] truncate max-w-[90px]">{p.brand || `P${i + 1}`}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, ri) => (
                  <tr key={ri} className={`border-b border-[var(--border)] ${ri % 2 !== 0 ? 'bg-[var(--s2)]' : ''}`}>
                    <td className="px-4 py-2.5 text-[var(--sub)] font-semibold text-xs">{row.label}</td>
                    {row.values.map((v, vi) => (
                      <td key={vi} className="px-4 py-2.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {v.isWinner && <span className="text-[13px]">&#x1F3C6;</span>}
                          <span
                            className={`font-mono ${v.isWinner ? 'font-bold text-sm' : 'font-normal text-[13px]'}`}
                            style={{ color: v.isWinner ? PALETTE[vi] : 'var(--ink)' }}
                          >
                            {fmt(v.value, row.format)}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="section-divider" />

      {/* Win count bottom cards */}
      <div className="page-section">
        <div className="overflow-x-auto">
          <div className="gap-3" style={{ display: 'grid', gridTemplateColumns: `repeat(${products.length},1fr)` }}>
          {products.map((p, i) => (
            <div key={p.asin} className="card-flat animate-fade-up px-5 py-4 text-center min-w-[200px]" style={{ borderTop: `3px solid ${PALETTE[i]}` }}>
              <div className="font-mono text-4xl font-medium leading-none" style={{ color: PALETTE[i] }}>{winCounts[p.asin] || 0}</div>
              <div className="text-[11px] text-[var(--sub)] my-1 mb-1.5">metrics won</div>
              <div className="text-[11px] font-semibold text-[var(--ink)] truncate">{p.title?.slice(0, 30)}</div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}
