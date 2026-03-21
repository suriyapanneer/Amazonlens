import { useState } from 'react';
import { tierColor, tierBg, tierLabel } from '../lib/format';
import { exportKeywordsCSV } from '../lib/export';

const Empty = ({ onUpload }) => (
  <div className="text-center py-24 px-5">
    <div className="text-5xl mb-4 animate-[float_3s_ease-in-out_infinite]">🔍</div>
    <div className="font-sora text-xl font-bold text-[var(--ink)] mb-2">No keyword data</div>
    <p className="text-[var(--sub)] mb-6 text-sm">Upload a Cerebro CSV to analyse keywords</p>
    <button className="btn btn-amber" onClick={onUpload}>Upload Cerebro CSV →</button>
  </div>
);

const TIER_INFO = {
  ZERO_COMP: { label: '🎯 Zero Competition', desc: 'Search volume, zero competing products — rank immediately' },
  GOLD:      { label: '🥇 Gold',             desc: 'High IQ + high volume — highest priority targets' },
  SILVER:    { label: '🥈 Silver',           desc: 'Good IQ + decent volume — manual campaigns' },
  BRONZE:    { label: '🥉 Bronze',           desc: 'Moderate volume — auto campaigns only' },
};

export default function KeywordsPage({ data, onUpload }) {
  const [tier, setTier] = useState('ALL');
  const [search, setSearch] = useState('');
  if (!data) return <Empty onUpload={onUpload} />;

  const tiers = data.tiers || {};
  let rows = tier === 'ALL' ? data.keywords : (tiers[tier] || []);
  if (search) rows = rows.filter(k => k.keyword.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header animate-fade-up flex justify-between items-end flex-wrap gap-3">
        <div>
          <div className="page-subtitle">Keyword Intelligence</div>
          <h1 className="page-title">{data.keywords?.length || 0} Keywords Analysed</h1>
        </div>
        <button className="btn btn-outline text-xs" onClick={() => exportKeywordsCSV(rows)}>↓ Export CSV</button>
      </div>

      {/* Tier cards */}
      <div className="page-section">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(TIER_INFO).map(([t, info], i) => {
            const count = tiers[t]?.length || 0;
            const active = tier === t;
            const c = tierColor(t);
            const bg = tierBg(t);
            return (
              <div
                key={t}
                className={`card animate-fade-up animate-fade-up-${i + 1} cursor-pointer p-5`}
                onClick={() => setTier(tier === t ? 'ALL' : t)}
                style={{
                  border: `1px solid ${active ? c + '40' : 'var(--border)'}`,
                  background: active ? bg : 'var(--surface)',
                  boxShadow: active ? `0 4px 16px ${c}18` : 'var(--sh-card)',
                }}
              >
                <div className="font-mono text-xl sm:text-2xl lg:text-[28px] font-medium leading-none mb-1.5" style={{ color: c }}>{count}</div>
                <div className="text-[13px] font-bold text-[var(--ink2)]">{info.label}</div>
                <div className="text-[11px] text-[var(--sub)] mt-1 leading-relaxed">{info.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trending keywords */}
      <div className="page-section">
        {data.trending?.length > 0 && (
          <div className="card-flat animate-fade-up p-5 border border-[rgba(10,122,74,.16)]" style={{ background: 'rgba(10,122,74,.04)' }}>
            <div className="font-mono text-[10px] text-[var(--green)] tracking-[2px] uppercase mb-3">📈 Trending Keywords (30%+ growth)</div>
            <div className="flex flex-wrap gap-[7px]">
              {data.trending.map((k, i) => (
                <span key={i} className="badge badge-green cursor-default">{k.keyword} <span className="opacity-70">+{k.trend}%</span></span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="section-divider" />

      {/* Search + tier filter buttons */}
      <div className="page-section">
        <div className="animate-fade-up animate-fade-up-2 flex gap-2 mb-5 flex-wrap items-center">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search keywords…"
            className="flex-1 min-w-[180px] bg-[var(--surface)] border border-[var(--border2)] text-[var(--ink)] px-3.5 py-2 rounded-lg text-[13px] outline-none shadow-[var(--sh1)]"
          />
          {['ALL', 'ZERO_COMP', 'GOLD', 'SILVER', 'BRONZE'].map(f => (
            <button key={f} onClick={() => setTier(f)} className={`btn ${tier === f ? 'tab-active' : 'btn-outline'} px-3 py-1.5 text-[11px]`}>
              {f === 'ALL' ? `All (${data.keywords?.length || 0})` : tierLabel(f)}
            </button>
          ))}
        </div>
      </div>

      {/* Keywords table */}
      <div className="page-section">
        <div className="card animate-fade-up animate-fade-up-3 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px] min-w-[700px]">
              <thead>
                <tr className="bg-[var(--s2)] border-b border-[var(--border)]">
                  {['#', 'Keyword', 'Tier', 'Search Vol', 'IQ Score', 'Competing', 'Trend'].map(h => (
                    <th key={h} className="px-3.5 py-2.5 text-left font-mono text-[10px] text-[var(--sub)] tracking-[1px] uppercase font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 200).map((kw, i) => {
                  const c = tierColor(kw.tier);
                  const bg = tierBg(kw.tier);
                  return (
                    <tr key={i} className="border-b border-[var(--border)]">
                      <td className="px-3.5 py-[9px] font-mono text-[11px] text-[var(--muted)]">#{i + 1}</td>
                      <td className="px-3.5 py-[9px] font-semibold text-[var(--ink2)] max-w-[240px]">
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap">{kw.keyword}</div>
                      </td>
                      <td className="px-3.5 py-[9px]">
                        <span className="badge text-[10px]" style={{ background: bg, color: c, border: `1px solid ${c}25` }}>{tierLabel(kw.tier)}</span>
                      </td>
                      <td className="px-3.5 py-[9px] font-mono text-[var(--amber)] font-semibold">{kw.searchVol.toLocaleString()}</td>
                      <td className="px-3.5 py-[9px] font-mono text-[var(--sky)]">{kw.iqScore.toLocaleString()}</td>
                      <td className="px-3.5 py-[9px] font-mono">
                        <span className="font-bold" style={{ color: kw.competing === 0 ? 'var(--green)' : kw.competing < 100 ? 'var(--amber)' : 'var(--red)' }}>
                          {kw.competing === 0 ? '🎯 ZERO' : kw.competing.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3.5 py-[9px] font-mono" style={{ color: kw.trend > 30 ? 'var(--green)' : kw.trend < 0 ? 'var(--red)' : 'var(--sub)' }}>
                        {kw.trend > 0 ? `+${kw.trend}%` : kw.trend !== 0 ? `${kw.trend}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rows.length > 200 && (
            <div className="px-4 py-2.5 border-t border-[var(--border)] text-[11px] text-[var(--sub)] bg-[var(--s2)]">
              Showing 200 of {rows.length} — export CSV to see all
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
