import { useState } from 'react';
import { fmtINR, fmtNum } from '../lib/format';
import { exportProductsCSV } from '../lib/export';
import MoatBar from '../components/data-display/MoatBar';

const Empty = ({ onUpload }) => (
  <div className="text-center py-24 px-5">
    <div className="text-5xl mb-4 animate-[float_3s_ease-in-out_infinite]">⚔️</div>
    <div className="font-sora text-xl font-bold text-[var(--ink)] mb-2">No data yet</div>
    <button className="btn btn-amber" onClick={onUpload}>Upload Xray CSV →</button>
  </div>
);

export default function CompetitorPage({ data, onUpload }) {
  const [sort, setSort] = useState('revenue');
  const [filterNew, setFilterNew] = useState(false);
  if (!data) return <Empty onUpload={onUpload} />;

  let products = [...data.products];
  if (filterNew) products = products.filter(p => p.sellerAge > 0 && p.sellerAge <= 12);
  products.sort((a, b) => sort === 'moat' ? a.moatScore - b.moatScore : sort === 'reviews' ? a.reviews - b.reviews : sort === 'age' ? a.sellerAge - b.sellerAge : b.revenue - a.revenue);

  const weakest = [...data.products].sort((a, b) => a.moatScore - b.moatScore)[0];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header animate-fade-up flex justify-between items-end flex-wrap gap-3">
        <div>
          <div className="page-subtitle">Competitor Analysis</div>
          <h1 className="page-title">Who You're Up Against</h1>
          <p className="text-[var(--sub)] text-[13px] mt-1">Moat Score = how hard each competitor is to beat. Lower = easier target.</p>
        </div>
        <button className="btn btn-outline text-xs" onClick={() => exportProductsCSV(products, 'competitors')}>↓ Export CSV</button>
      </div>

      {/* Recommended target */}
      <div className="page-section">
        {weakest && (
          <div className="card animate-fade-up animate-fade-up-1 relative p-6 overflow-hidden border border-[rgba(10,122,74,.18)]" style={{ background: 'linear-gradient(135deg,rgba(10,122,74,.04),rgba(10,122,74,.01))' }}>
            <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[14px]" style={{ background: 'linear-gradient(90deg,var(--green),var(--green) 60%)' }} />
            <div className="font-mono text-[10px] text-[var(--green)] tracking-[2px] uppercase mb-3">🎯 Recommended Target Competitor</div>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <div className="text-base font-bold text-[var(--ink2)] mb-1">{weakest.brand}</div>
                <div className="text-xs text-[var(--sub)] max-w-[400px] overflow-hidden text-ellipsis whitespace-nowrap">{weakest.title}</div>
              </div>
              <div className="flex gap-3.5">
                {[
                  { l: 'Moat Score', v: weakest.moatScore, c: 'var(--green)' },
                  { l: 'Revenue/mo', v: fmtINR(weakest.revenue), c: 'var(--amber)' },
                  { l: 'Reviews', v: weakest.reviews, c: 'var(--sky)' },
                ].map(x => (
                  <div key={x.l} className="text-center">
                    <div className="font-mono text-lg font-semibold" style={{ color: x.c }}>{x.v}</div>
                    <div className="text-[10px] text-[var(--sub)] uppercase tracking-[0.8px]">{x.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="section-divider" />

      {/* Sort & filter controls */}
      <div className="page-section">
        <div className="animate-fade-up animate-fade-up-2 flex gap-2 mb-5 flex-wrap items-center">
          <span className="text-xs text-[var(--sub)] font-semibold">Sort:</span>
          {[['revenue', '💰 Revenue'], ['moat', '🛡️ Moat'], ['reviews', '⭐ Reviews'], ['age', '📅 Age']].map(([s, l]) => (
            <button key={s} onClick={() => setSort(s)} className={`btn ${sort === s ? 'tab-active' : 'btn-outline'} px-3 py-[5px] text-xs`}>{l}</button>
          ))}
          <button onClick={() => setFilterNew(!filterNew)} className={`btn ${filterNew ? 'btn-green' : 'btn-outline'} px-3.5 py-[5px] text-xs ml-auto`}>
            🚀 {filterNew ? '✓' : ''} New Sellers Only (&lt;12mo)
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="page-section">
        <div className="card animate-fade-up animate-fade-up-3 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px] min-w-[700px]">
              <thead>
                <tr className="bg-[var(--s2)] border-b border-[var(--border)]">
                  {['Brand', 'Price', 'Sales/mo', 'Revenue/mo', 'Reviews', 'Rating', 'Age (mo)', 'FBA', 'Moat Score'].map(h => (
                    <th key={h} className="px-3.5 py-2.5 text-left font-mono text-[10px] text-[var(--sub)] tracking-[1px] uppercase font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => {
                  const isNew = p.sellerAge > 0 && p.sellerAge <= 12;
                  const isFBM = !p.fulfillment?.toUpperCase().includes('FBA');
                  const isWeak = p.moatScore < 35;
                  return (
                    <tr key={i} className="border-b border-[var(--border)] transition-colors duration-150" style={{ background: isWeak ? 'rgba(10,122,74,.025)' : 'transparent' }}>
                      <td className="px-3.5 py-2.5 max-w-[180px]">
                        <div className="font-semibold text-[var(--ink2)] overflow-hidden text-ellipsis whitespace-nowrap text-xs" title={p.title}>{p.brand}</div>
                        {isNew && <span className="badge badge-green mt-0.5 text-[9px]">NEW ≤12mo</span>}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-[var(--amber)] font-semibold">{fmtINR(p.price)}</td>
                      <td className="px-3.5 py-2.5 font-mono text-[var(--sky)]">{fmtNum(p.sales)}</td>
                      <td className="px-3.5 py-2.5 font-mono text-[var(--green)] font-semibold">{fmtINR(p.revenue)}</td>
                      <td className="px-3.5 py-2.5 font-mono">{fmtNum(p.reviews)}</td>
                      <td className="px-3.5 py-2.5 font-mono">{p.rating > 0 ? p.rating.toFixed(1) + '⭐' : '—'}</td>
                      <td className="px-3.5 py-2.5 font-mono" style={{ color: isNew ? 'var(--green)' : 'var(--sub)' }}>{p.sellerAge || '—'}</td>
                      <td className="px-3.5 py-2.5">
                        <span className={`badge ${isFBM ? 'badge-amber' : 'badge-sky'} text-[10px]`}>{isFBM ? 'FBM' : 'FBA'}</span>
                      </td>
                      <td className="px-3.5 py-2.5 min-w-[200px]"><MoatBar score={p.moatScore} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-[var(--border)] text-[11px] text-[var(--sub)] bg-[var(--s2)]">
            Showing {products.length} of {data.products.length} products
          </div>
        </div>
      </div>
    </div>
  );
}
