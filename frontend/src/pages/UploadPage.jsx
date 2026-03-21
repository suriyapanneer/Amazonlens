import { useState, useRef } from 'react';
import { api } from '../lib/api';
import { fmtINR, fmtNum, vColor, vBg } from '../lib/format';

function Spinner({ color }) {
  return (
    <div
      className="w-7 h-7 rounded-full animate-spin"
      style={{ border: `3px solid ${color}30`, borderTopColor: color }}
    />
  );
}

function DropZone({ label, hint, file, loading, onFile, accent, bg, icon }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);
  const go = f => { if (f) onFile(f); };
  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); go(e.dataTransfer.files[0]); }}
      className="rounded-[14px] px-[18px] py-[26px] text-center cursor-pointer transition-all min-h-[155px] flex flex-col items-center justify-center gap-[7px]"
      style={{
        border: `2px dashed ${drag || file ? accent : 'var(--border2)'}`,
        background: drag || file ? bg : 'var(--surface)',
        boxShadow: file ? `0 4px 20px ${accent}18` : 'var(--sh1)',
      }}
    >
      <input ref={ref} type="file" accept=".csv" className="hidden" onChange={e => go(e.target.files[0])} />
      {loading
        ? <><Spinner color={accent} /><div className="text-xs" style={{ color: 'var(--sub)' }}>Parsing CSV…</div></>
        : file
          ? <>
              <div className="text-[28px]">{icon}</div>
              <div className="text-xs font-bold max-w-[170px] overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: accent }}>{file.name}</div>
              <span className="badge text-[10px]" style={{ background: bg, color: accent, border: `1px solid ${accent}25` }}>✓ Uploaded · click to replace</span>
            </>
          : <>
              <div className="text-[30px] animate-float">{icon}</div>
              <div className="text-[13px] font-bold" style={{ color: 'var(--ink2)' }}>{label}</div>
              <div className="text-[11px] leading-[1.65] max-w-[185px]" style={{ color: 'var(--sub)' }}>{hint}</div>
              <div className="mt-1 py-[5px] px-4 rounded-[20px] text-[11px] font-bold" style={{ background: bg, border: `1px solid ${accent}30`, color: accent }}>Browse or Drop CSV</div>
            </>}
    </div>
  );
}

function DBFeedback({ saved, updated }) {
  if (!saved && !updated) return null;
  return (
    <div className="flex gap-1.5 mt-[7px]">
      {saved > 0 && <span className="badge badge-green">+{saved} saved</span>}
      {updated > 0 && <span className="badge badge-sky">↻ {updated} updated</span>}
    </div>
  );
}

export default function UploadPage({ onXray, onCerebro, onBlackBox, onNext, xrayData, cerebroData, blackBoxData }) {
  const [files, setFiles] = useState({ xray: null, cerebro: null, bb: null });
  const [loading, setLoading] = useState({ xray: false, cerebro: false, bb: false });
  const [dbInfo, setDbInfo] = useState({});
  const [error, setError] = useState('');

  const handle = async (key, file, apiCall, cb) => {
    setFiles(f => ({ ...f, [key]: file })); setError('');
    setLoading(l => ({ ...l, [key]: true }));
    try { const r = await apiCall(file); cb(r); if (r.db) setDbInfo(d => ({ ...d, [key]: r.db })); }
    catch (e) { setError(`${key}: ${e.message}`); }
    finally { setLoading(l => ({ ...l, [key]: false })); }
  };

  const s = xrayData?.stats; const v = xrayData?.verdict;
  const zones = [
    { key: 'xray', label: 'Xray Export', hint: 'Chrome Extension → Amazon search → Xray → Export CSV', icon: '📊', accent: 'var(--amber)', bg: 'rgba(201,122,0,.06)', required: true, apiCall: api.uploadXray, cb: onXray },
    { key: 'cerebro', label: 'Cerebro Export', hint: 'cerebro.helium10.com → paste ASIN → Export CSV', icon: '🔍', accent: 'var(--sky)', bg: 'rgba(7,98,184,.06)', required: false, apiCall: api.uploadCerebro, cb: onCerebro },
    { key: 'bb', label: 'Black Box Export', hint: 'blackbox.helium10.com → set filters → Export CSV', icon: '📦', accent: 'var(--green)', bg: 'rgba(10,122,74,.06)', required: false, apiCall: api.uploadBlackBox, cb: onBlackBox },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header animate-fade-up text-center">
        <div className="page-subtitle">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--amber)' }} />
          <span className="text-[11px] font-bold tracking-[1.5px] uppercase" style={{ color: 'var(--amber)' }}>Step 01 — Import Data</span>
        </div>
        <h1 className="page-title">
          Upload Your <span style={{ color: 'var(--amber)' }}>Helium 10</span> Exports
        </h1>
        <p className="text-sm max-w-[460px] mx-auto leading-[1.8]" style={{ color: 'var(--sub)' }}>
          Drag & drop your CSV exports. Products saved locally — re-uploading updates records, no duplicates.
        </p>
      </div>

      {/* Upload Zones */}
      <div className="page-section-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((z, i) => (
            <div key={z.key} className={`animate-fade-up${i > 0 ? ` animate-fade-up-${i}` : ''}`}>
              <div className="flex items-center gap-[7px] mb-[9px]">
                <span className="text-xs font-bold" style={{ color: 'var(--ink2)' }}>{z.icon} {z.label}</span>
                {z.required
                  ? <span className="badge badge-red text-[9px]">Required</span>
                  : <span className="badge badge-muted text-[9px]">Optional</span>}
              </div>
              <DropZone {...z} file={files[z.key]} loading={loading[z.key]} onFile={f => handle(z.key, f, z.apiCall, z.cb)} />
              <DBFeedback {...(dbInfo[z.key] || {})} />
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="animate-fade-up flex gap-2 rounded-[10px] text-[13px] mb-4 py-[11px] px-4" style={{ background: 'var(--red-bg)', border: '1px solid rgba(192,37,53,.2)', color: 'var(--red)' }}>
          <span>⚠️</span>{error}
        </div>
      )}

      <div className="section-divider" />

      {/* Market Preview */}
      {xrayData && s && (
        <div className="page-section">
          <div className="card animate-fade-up p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[14px]" style={{ background: `linear-gradient(90deg,${vColor(v)},${vColor(v)}60)` }} />
            <div className="flex justify-between items-start mb-5 flex-wrap gap-2.5">
              <div>
                <div className="font-mono text-[10px] tracking-[2px] uppercase mb-1" style={{ color: 'var(--sub)' }}>Xray — {s.totalProducts} products</div>
                <div className="font-sora text-xl font-bold" style={{ color: 'var(--ink2)' }}>Market Preview</div>
              </div>
              <div className="py-[9px] px-[18px] rounded-[10px] text-[13px] font-extrabold" style={{ background: vBg(v), border: `1px solid ${vColor(v)}30`, color: vColor(v) }}>
                {v === 'ENTER' ? '✅' : v === 'WATCH' ? '⚠️' : '❌'} {v} — {xrayData.opportunityScore}/100
              </div>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-2.5">
              {[
                { l: 'Market/mo', v: fmtINR(s.totalRevenue), c: 'var(--amber)' },
                { l: 'Units/mo', v: fmtNum(s.totalUnits), c: 'var(--sky)' },
                { l: 'Avg Price', v: fmtINR(s.avgPrice), c: 'var(--green)' },
                { l: 'Avg Reviews', v: Math.round(s.avgReviews), c: 'var(--violet)' },
                { l: 'Avg Rating', v: (s.avgRating || 0).toFixed(1) + '⭐', c: 'var(--amber)' },
                { l: 'New Winners', v: s.newWinners, c: 'var(--green)' },
                { l: 'FBA Count', v: s.fbaCount, c: 'var(--sky)' },
                { l: 'Sponsored%', v: (s.sponsoredPct || 0).toFixed(0) + '%', c: 'var(--red)' },
              ].map(item => (
                <div key={item.l} className="rounded-[10px] py-3 px-3.5" style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderLeft: `3px solid ${item.c}` }}>
                  <div className="font-mono text-base font-medium" style={{ color: item.c }}>{item.v}</div>
                  <div className="text-[10px] mt-[3px] uppercase tracking-[0.8px] font-semibold" style={{ color: 'var(--sub)' }}>{item.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cerebro & BlackBox Summaries */}
      {(cerebroData || blackBoxData) && (
        <div className="page-section">
          <div className={`grid gap-4 ${cerebroData && blackBoxData ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            {cerebroData && (
              <div className="card-flat animate-fade-up p-5">
                <div className="font-mono text-[10px] tracking-[2px] uppercase mb-3" style={{ color: 'var(--sub)' }}>Cerebro — {cerebroData.total} keywords</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { l: '🎯 Zero Comp', v: cerebroData.tiers?.ZERO_COMP?.length || 0, cls: 'badge-green' },
                    { l: '🥇 Gold', v: cerebroData.tiers?.GOLD?.length || 0, cls: 'badge-amber' },
                    { l: '🥈 Silver', v: cerebroData.tiers?.SILVER?.length || 0, cls: 'badge-muted' },
                    { l: '📈 Trending', v: cerebroData.trending?.length || 0, cls: 'badge-sky' },
                  ].map(x => (
                    <div key={x.l} className="flex items-center gap-[7px] py-[7px] px-3 rounded-lg" style={{ background: 'var(--s3)', border: '1px solid var(--border)' }}>
                      <span className={`badge ${x.cls} py-[2px] px-[7px] text-xs font-mono font-semibold`}>{x.v}</span>
                      <span className="text-xs" style={{ color: 'var(--sub)' }}>{x.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {blackBoxData && (
              <div className="card-flat animate-fade-up p-5">
                <div className="font-mono text-[10px] tracking-[2px] uppercase mb-3" style={{ color: 'var(--sub)' }}>Black Box — {blackBoxData.total} products</div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {blackBoxData.categories?.slice(0, 5).map((c, i) => <span key={i} className="badge badge-green">{c}</span>)}
                </div>
                {blackBoxData.avgNetMargin > 0 && <span className="badge badge-amber">Avg Net: {blackBoxData.avgNetMargin}%</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* How to Export */}
      <div className="page-section">
        <div className="card-flat animate-fade-up p-6">
          <div className="font-mono text-[10px] tracking-[2px] uppercase mb-4" style={{ color: 'var(--sub)' }}>How to Export from Helium 10</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Xray Export', color: 'var(--amber)', steps: ['Open Amazon.in', 'Search product keyword', 'Click H10 Chrome Extension', 'Click Xray — wait for data', 'Export → CSV'] },
              { title: 'Cerebro Export', color: 'var(--sky)', steps: ['cerebro.helium10.com', 'Paste competitor ASIN', 'Get Keywords', 'Filter min SV: 300', 'Export → CSV'] },
              { title: 'Black Box Export', color: 'var(--green)', steps: ['blackbox.helium10.com', 'Set price/sales/review filters', 'Click Search', 'Review results', 'Export → CSV'] },
            ].map(g => (
              <div key={g.title}>
                <div className="text-xs font-bold mb-2.5 flex items-center gap-1.5" style={{ color: g.color }}>
                  <div className="w-[5px] h-[5px] rounded-full" style={{ background: g.color }} />
                  {g.title}
                </div>
                {g.steps.map((step, i) => (
                  <div key={i} className="flex gap-2 mb-[5px] text-xs" style={{ color: 'var(--sub)' }}>
                    <span className="font-mono shrink-0 text-[10px] mt-[2px]" style={{ color: g.color }}>{i + 1}.</span>
                    {step}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      {xrayData && (
        <button className="btn btn-amber animate-fade-up w-full py-[15px] text-sm rounded-xl" onClick={onNext}>
          View Market Dashboard →
        </button>
      )}
    </div>
  );
}
