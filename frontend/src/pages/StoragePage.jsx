import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { HardDrive, Database, FileText, Search, BarChart3, Trash2, AlertTriangle, Package, RefreshCw, Clock } from 'lucide-react';

function fmtBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function UsageBar({ used, limit, color = 'var(--amber)', label, icon: Icon, bytes }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const isHigh = pct >= 80;
  const barColor = isHigh ? 'var(--red)' : color;

  return (
    <div className="card p-5 animate-fade-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}12`, color }}>
            <Icon size={18} />
          </div>
          <div>
            <div className="text-sm font-bold text-[var(--ink2)]">{label}</div>
            <div className="text-[11px] text-[var(--muted)]">
              {bytes != null && `${fmtBytes(bytes)} estimated`}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-base sm:text-lg font-semibold" style={{ color: barColor }}>{used.toLocaleString()}</div>
          <div className="text-[10px] text-[var(--sub)]">of {limit.toLocaleString()}</div>
        </div>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--s3)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] font-mono" style={{ color: barColor }}>{pct.toFixed(1)}% used</span>
        <span className="text-[10px] text-[var(--muted)]">{(limit - used).toLocaleString()} remaining</span>
      </div>
    </div>
  );
}

function DangerAction({ label, desc, onConfirm, loading, icon: Icon = Trash2 }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-xl border transition-all"
      style={{ borderColor: confirming ? 'rgba(192,37,53,.3)' : 'var(--border)', background: confirming ? 'rgba(192,37,53,.03)' : 'transparent' }}>
      <div className="flex items-center gap-3">
        <Icon size={16} className="text-[var(--red)] shrink-0" />
        <div>
          <div className="text-sm font-semibold text-[var(--ink2)]">{label}</div>
          <div className="text-[11px] text-[var(--sub)]">{desc}</div>
        </div>
      </div>
      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--red)] font-semibold">Are you sure?</span>
          <button className="btn btn-outline px-3 py-1 text-[11px]" onClick={() => setConfirming(false)}>Cancel</button>
          <button className="px-3 py-1 rounded-lg text-[11px] font-bold text-white transition-all"
            style={{ background: 'var(--red)' }}
            onClick={() => { onConfirm(); setConfirming(false); }}
            disabled={loading}>
            {loading ? '...' : 'Delete'}
          </button>
        </div>
      ) : (
        <button className="btn btn-outline px-3 py-1.5 text-[11px] text-[var(--red)] border-[rgba(192,37,53,.25)]"
          onClick={() => setConfirming(true)}>
          Delete
        </button>
      )}
    </div>
  );
}

export default function StoragePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState('');

  const load = () => {
    setLoading(true);
    api.getStorageOverview()
      .then(r => setData(r))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (type, extra = {}) => {
    setDeleting(type);
    try {
      await api.deleteStorageData({ type, ...extra });
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting('');
    }
  };

  if (loading && !data) {
    return (
      <div className="text-center py-20 text-[var(--sub)]">
        <div className="w-9 h-9 border-[3px] border-[var(--amber)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Loading storage data...
      </div>
    );
  }

  if (!data) return null;

  const { usage, details, staleProducts } = data;
  const totalDBPct = usage.database.limitMB > 0 ? ((usage.database.usedMB / usage.database.limitMB) * 100).toFixed(1) : 0;
  const totalFilePct = usage.fileStorage.limitMB > 0 ? ((usage.fileStorage.usedMB / usage.fileStorage.limitMB) * 100).toFixed(2) : 0;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header animate-fade-up flex justify-between items-end flex-wrap gap-3">
        <div>
          <div className="page-subtitle">Data Management</div>
          <h1 className="page-title">Storage & Usage</h1>
        </div>
        <button className="btn btn-outline text-xs flex items-center gap-1.5" onClick={load} disabled={loading}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Total storage overview */}
      <div className="page-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card animate-fade-up p-6 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-[80px] h-[80px] rounded-full opacity-[.06] pointer-events-none" style={{ background: 'var(--amber)' }} />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--amber-bg)] text-[var(--amber)]">
                <Database size={20} />
              </div>
              <div>
                <div className="text-xs text-[var(--sub)] font-semibold">Database Storage</div>
                <div className="font-mono text-base sm:text-xl font-semibold text-[var(--amber)]">{usage.database.usedMB} MB</div>
              </div>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--s3)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, totalDBPct)}%`, background: 'linear-gradient(90deg, var(--amber), #e8920c)' }} />
            </div>
            <div className="text-[10px] text-[var(--sub)] mt-1.5">{totalDBPct}% of {usage.database.limitMB} MB free tier</div>
          </div>

          <div className="card animate-fade-up p-6 relative overflow-hidden" style={{ animationDelay: '60ms' }}>
            <div className="absolute -top-6 -right-6 w-[80px] h-[80px] rounded-full opacity-[.06] pointer-events-none" style={{ background: 'var(--sky)' }} />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--sky-bg)] text-[var(--sky)]">
                <HardDrive size={20} />
              </div>
              <div>
                <div className="text-xs text-[var(--sub)] font-semibold">File Storage (PDFs)</div>
                <div className="font-mono text-base sm:text-xl font-semibold text-[var(--sky)]">{usage.fileStorage.usedMB} MB</div>
              </div>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--s3)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, totalFilePct)}%`, background: 'linear-gradient(90deg, var(--sky), #0987d4)' }} />
            </div>
            <div className="text-[10px] text-[var(--sub)] mt-1.5">{totalFilePct}% of {usage.fileStorage.limitMB} MB free tier</div>
          </div>
        </div>
      </div>

      <div className="section-divider" />

      {/* Per-category usage */}
      <div className="page-section">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <UsageBar used={usage.products.used} limit={usage.products.limit} color="var(--amber)" label="Products" icon={Package} bytes={usage.products.bytes} />
          <UsageBar used={usage.keywords.used} limit={usage.keywords.limit} color="var(--sky)" label="Keywords" icon={Search} bytes={usage.keywords.bytes} />
          <UsageBar used={usage.analyses.used} limit={usage.analyses.limit} color="var(--green)" label="Analyses" icon={BarChart3} bytes={usage.analyses.bytes} />
          <UsageBar used={usage.reports.used} limit={usage.reports.limit} color="var(--violet)" label="Reports" icon={FileText} bytes={usage.reports.bytes} />
        </div>
      </div>

      <div className="section-divider" />

      {/* Stale data alert */}
      <div className="page-section">
        {staleProducts?.length > 0 && (
          <div className="card animate-fade-up p-5" style={{ background: 'rgba(201,122,0,.04)', border: '1px solid rgba(201,122,0,.2)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <Clock size={18} className="text-[var(--amber)]" />
                <div>
                  <div className="text-sm font-bold text-[var(--ink2)]">Stale Data Detected</div>
                  <div className="text-[11px] text-[var(--sub)]">{staleProducts.length} products not updated in 30+ days</div>
                </div>
              </div>
              <DangerAction
                label={`Clean ${staleProducts.length} stale products`}
                desc="Removes products and their keywords"
                onConfirm={() => handleDelete('stale_products')}
                loading={deleting === 'stale_products'}
                icon={Clock}
              />
            </div>
            <div className="max-h-[140px] overflow-y-auto overflow-x-auto">
              <table className="w-full text-[12px]">
                <tbody>
                  {staleProducts.slice(0, 10).map(p => (
                    <tr key={p.asin} className="border-b border-[var(--border)]">
                      <td className="py-1.5 font-mono text-[var(--sub)]">{p.asin}</td>
                      <td className="py-1.5 text-[var(--ink)] truncate max-w-[300px]">{p.title || '—'}</td>
                      <td className="py-1.5 text-[var(--muted)] text-right text-[11px]">
                        {new Date(p.updated_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-1.5 text-right">
                        <button
                          className="text-[var(--red)] text-[11px] hover:underline"
                          onClick={() => handleDelete('product', { asin: p.asin })}
                          disabled={deleting === `product-${p.asin}`}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {staleProducts.length > 10 && (
                    <tr><td colSpan={4} className="py-1.5 text-[var(--muted)] text-center">+{staleProducts.length - 10} more</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="section-divider" />

      {/* Detailed data tables */}
      <div className="page-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Analyses list */}
          <div className="card animate-fade-up overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[var(--border)] flex justify-between items-center">
              <span className="font-mono text-[10px] text-[var(--sub)] tracking-[2px] uppercase">Saved Analyses ({details.analyses.length})</span>
            </div>
            {details.analyses.length === 0 ? (
              <div className="py-8 text-center text-[var(--muted)] text-sm">No analyses saved</div>
            ) : (
              <div className="max-h-[200px] overflow-y-auto">
                {details.analyses.map(a => (
                  <div key={a.id} className="flex items-center justify-between flex-wrap gap-2 px-5 py-2.5 border-b border-[var(--border)] hover:bg-[var(--s2)]">
                    <div>
                      <div className="text-xs font-semibold text-[var(--ink2)]">{a.name}</div>
                      <div className="text-[10px] text-[var(--muted)]">{new Date(a.created_at).toLocaleDateString('en-IN')}</div>
                    </div>
                    <button className="text-[var(--red)] text-[11px] hover:underline"
                      onClick={() => handleDelete('analysis', { id: a.id })}
                      disabled={deleting === 'analysis'}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reports list */}
          <div className="card animate-fade-up overflow-hidden" style={{ animationDelay: '60ms' }}>
            <div className="px-5 py-3.5 border-b border-[var(--border)] flex justify-between items-center">
              <span className="font-mono text-[10px] text-[var(--sub)] tracking-[2px] uppercase">Generated Reports ({details.reports.length})</span>
            </div>
            {details.reports.length === 0 ? (
              <div className="py-8 text-center text-[var(--muted)] text-sm">No reports generated</div>
            ) : (
              <div className="max-h-[200px] overflow-y-auto">
                {details.reports.map(r => (
                  <div key={r.id} className="flex items-center justify-between flex-wrap gap-2 px-5 py-2.5 border-b border-[var(--border)] hover:bg-[var(--s2)]">
                    <div>
                      <div className="text-xs font-semibold text-[var(--ink2)]">{r.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="badge badge-muted text-[9px]">{r.report_type}</span>
                        <span className="text-[10px] text-[var(--muted)]">{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                    <button className="text-[var(--red)] text-[11px] hover:underline"
                      onClick={() => handleDelete('report', { id: r.id })}
                      disabled={deleting === 'report'}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="section-divider" />

      {/* Bulk delete danger zone */}
      <div className="page-section">
        <div className="animate-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-[var(--red)]" />
            <span className="font-mono text-[10px] text-[var(--red)] tracking-[2px] uppercase font-semibold">Danger Zone</span>
          </div>
          <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: 'rgba(192,37,53,.2)' }}>
            <div className="flex flex-col divide-y" style={{ divideColor: 'var(--border)' }}>
              <DangerAction
                label="Delete All Keywords"
                desc={`Remove all ${usage.keywords.used.toLocaleString()} keyword rows — frees ~${fmtBytes(usage.keywords.bytes)}`}
                onConfirm={() => handleDelete('all_keywords')}
                loading={deleting === 'all_keywords'}
                icon={Search}
              />
              <DangerAction
                label="Delete All Products"
                desc={`Remove all ${usage.products.used} products and their keywords — frees ~${fmtBytes(usage.products.bytes + usage.keywords.bytes)}`}
                onConfirm={() => handleDelete('all_products')}
                loading={deleting === 'all_products'}
                icon={Package}
              />
              <DangerAction
                label="Delete All Analyses"
                desc={`Remove all ${usage.analyses.used} analyses and reports — frees ~${fmtBytes(usage.analyses.bytes + usage.reports.bytes)}`}
                onConfirm={() => handleDelete('all_analyses')}
                loading={deleting === 'all_analyses'}
                icon={BarChart3}
              />
              <DangerAction
                label="Delete All Reports"
                desc={`Remove all ${usage.reports.used} reports and PDF files — frees ~${fmtBytes(usage.reports.bytes)} DB + ${usage.fileStorage.usedMB} MB files`}
                onConfirm={() => handleDelete('all_reports')}
                loading={deleting === 'all_reports'}
                icon={FileText}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
