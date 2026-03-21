import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { FileText, Download, Clock, Trash2, RefreshCw } from 'lucide-react';

const REPORT_TYPES = [
  { key: 'market', label: 'Market Analysis', desc: 'Full market overview with top products and forecast', icon: '📊' },
  { key: 'comparison', label: 'Product Comparison', desc: 'Side-by-side comparison of selected products', icon: '⚖️' },
  { key: 'profit', label: 'Profit Analysis', desc: 'Detailed cost breakdown and investment summary', icon: '💰' },
];

export default function ReportsPage({ analysis, xrayData, costs, compareData }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState('');

  const load = () => {
    setLoading(true);
    api.getReports().then(r => setReports(r.reports || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const generate = async (type) => {
    setGenerating(type);
    try {
      let data = {};
      let title = '';

      if (type === 'market') {
        const prodRes = await api.getProducts();
        const products = prodRes.products || [];
        const totalRevenue = products.reduce((a, p) => a + (p.monthly_revenue || 0), 0);
        data = {
          products,
          stats: {
            totalProducts: products.length,
            totalRevenue,
            avgPrice: products.reduce((a, p) => a + (p.price || 0), 0) / (products.length || 1),
            avgReviews: products.reduce((a, p) => a + (p.reviews || 0), 0) / (products.length || 1),
            avgRating: products.reduce((a, p) => a + (p.rating || 0), 0) / (products.length || 1),
            sellableCount: products.filter(p => p.sellable).length,
            newWinners: products.filter(p => p.seller_age > 0 && p.seller_age <= 12 && p.monthly_revenue >= 100000).length,
            sponsoredPct: (products.filter(p => p.sponsored).length / (products.length || 1)) * 100,
          },
          verdict: analysis?.verdict,
          opportunityScore: analysis?.opportunityScore,
          forecast: analysis?.forecast,
          costs,
        };
        title = 'Market Analysis Report';
      } else if (type === 'comparison' && compareData) {
        data = compareData;
        title = 'Product Comparison Report';
      } else if (type === 'profit' && costs) {
        const profitRes = await api.calcProfit(costs);
        data = { costs, result: profitRes };
        title = 'Profit Analysis Report';
      }

      await api.generateReport({ type, title, data });
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating('');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header animate-fade-up">
        <div className="page-subtitle">Reports</div>
        <div className="flex justify-between items-end flex-wrap gap-3">
          <h1 className="page-title">Generated Reports</h1>
          <button className="btn btn-outline text-xs flex items-center gap-1.5" onClick={load}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Generate section */}
      <div className="page-section">
        <div className="animate-fade-up grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_TYPES.map((rt) => (
            <div key={rt.key} className="card p-6 flex flex-col justify-between">
              <div>
                <div className="text-2xl mb-2">{rt.icon}</div>
                <div className="text-sm font-bold text-[var(--ink2)] mb-1">{rt.label}</div>
                <div className="text-[11px] text-[var(--sub)] leading-relaxed mb-3">{rt.desc}</div>
              </div>
              <button
                onClick={() => generate(rt.key)}
                disabled={generating === rt.key}
                className="btn btn-amber w-full py-2 text-xs"
              >
                {generating === rt.key ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Generating…
                  </span>
                ) : (
                  'Generate PDF'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="section-divider" />

      {/* Reports list */}
      <div className="page-section">
        {loading ? (
          <div className="text-center py-16 text-[var(--sub)]">
            <div className="w-9 h-9 border-[3px] border-[var(--amber)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            Loading reports…
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 animate-fade-up">
            <FileText size={48} strokeWidth={1} className="mx-auto mb-4 text-[var(--muted)]" />
            <div className="font-sora text-xl font-bold mb-2 text-[var(--ink)]">No reports yet</div>
            <p className="text-sm text-[var(--sub)]">Generate your first report using the options above.</p>
          </div>
        ) : (
          <div className="grid gap-3 animate-fade-up">
            {reports.map((r) => (
              <div key={r.id} className="card p-5 flex items-center justify-between flex-wrap gap-3 transition-all hover:-translate-y-0.5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--amber-bg)] text-[var(--amber)]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--ink2)]">{r.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="badge badge-muted text-[10px]">{r.report_type}</span>
                      <span className="flex items-center gap-1 text-[11px] text-[var(--muted)]">
                        <Clock size={11} /> {new Date(r.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {r.pdf_url && (
                    <a href={r.pdf_url} target="_blank" rel="noopener noreferrer"
                      className="btn btn-outline px-3 py-1.5 text-xs flex items-center gap-1.5">
                      <Download size={13} /> Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
