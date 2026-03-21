import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import StatCard from '../components/data-display/StatCard';
import CustomTooltip from '../components/charts/CustomTooltip';
import { fmtINR, fmtNum, fmtPct, vColor, vBg } from '../lib/format';
import { exportProductsCSV } from '../lib/export';

const PIE_COLORS = ['#c97a00','#0762b8','#0a7a4a','#c02535','#7040b0','#e8920c','#3a86c8','#1a9e6a'];

const Empty = ({ onUpload }) => (
  <div className="text-center py-[100px] px-5">
    <div className="text-[52px] mb-4 animate-float">📊</div>
    <div className="font-sora text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>No data yet</div>
    <p className="text-sm mb-6" style={{ color: 'var(--sub)' }}>Upload an Xray CSV to see your market dashboard</p>
    <button className="btn btn-amber" onClick={onUpload}>Upload Xray CSV →</button>
  </div>
);

export default function DashboardPage({ data, onUpload }) {
  if (!data) return <Empty onUpload={onUpload} />;
  const { stats: s, topSellers, opportunityScore, verdict } = data;

  const pieData = topSellers.slice(0, 8).map(sel => ({ name: sel.name, value: sel.revenue, share: sel.share }));
  const priceDistData = (() => {
    const b = { '<₹200': 0, '₹200-400': 0, '₹400-600': 0, '₹600-800': 0, '₹800-1K': 0, '>₹1K': 0 };
    data.products.forEach(p => { if (p.price < 200) b['<₹200']++; else if (p.price < 400) b['₹200-400']++; else if (p.price < 600) b['₹400-600']++; else if (p.price < 800) b['₹600-800']++; else if (p.price < 1000) b['₹800-1K']++; else b['>₹1K']++; });
    return Object.entries(b).map(([range, count]) => ({ range, count }));
  })();
  const reviewDist = (() => {
    const b = { '0-50': 0, '51-200': 0, '201-500': 0, '501-1K': 0, '>1K': 0 };
    data.products.forEach(p => { if (p.reviews <= 50) b['0-50']++; else if (p.reviews <= 200) b['51-200']++; else if (p.reviews <= 500) b['201-500']++; else if (p.reviews <= 1000) b['501-1K']++; else b['>1K']++; });
    return Object.entries(b).map(([range, count]) => ({ range, count }));
  })();

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header animate-fade-up">
        <div className="page-subtitle">Market Analysis</div>
        <div className="flex justify-between items-end flex-wrap gap-3">
          <h1 className="page-title">Market Dashboard</h1>
          <button className="btn btn-outline text-xs" onClick={() => exportProductsCSV(data.products, 'xray-products')}>↓ Export Products</button>
        </div>
      </div>

      {/* Verdict Banner */}
      <div className="page-section">
        <div
          className="animate-fade-up animate-fade-up-1 rounded-[14px] py-[18px] px-6 flex items-center justify-between flex-wrap gap-3"
          style={{ background: vBg(verdict), border: `1px solid ${vColor(verdict)}25`, boxShadow: `0 4px 20px ${vColor(verdict)}10` }}
        >
          <div>
            <div className="font-mono text-[10px] tracking-[2px] uppercase mb-1" style={{ color: 'var(--sub)' }}>Opportunity Score</div>
            <div className="font-sora text-xl sm:text-2xl lg:text-[26px] font-extrabold" style={{ color: vColor(verdict) }}>
              {verdict === 'ENTER' ? '✅' : verdict === 'WATCH' ? '⚠️' : '❌'} {verdict} — {opportunityScore}/100
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {s.newWinners >= 2  && <span className="badge badge-green">✅ New sellers winning</span>}
            {s.avgReviews < 300 && <span className="badge badge-green">✅ Low review barrier</span>}
            {s.avgPrice < 1000  && <span className="badge badge-green">✅ 0% Referral fee zone</span>}
            {s.sponsoredPct < 30 && <span className="badge badge-green">✅ Organic available</span>}
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="page-section-lg">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Market/mo', value: fmtINR(s.totalRevenue),        color: 'var(--amber)', icon: '💰', animClass: 'animate-fade-up animate-fade-up-1' },
            { label: 'Total Units/mo',  value: fmtNum(s.totalUnits),           color: 'var(--sky)',   icon: '📦', animClass: 'animate-fade-up animate-fade-up-2' },
            { label: 'Avg Price',       value: fmtINR(s.avgPrice),             color: 'var(--green)', icon: '🏷️', animClass: 'animate-fade-up animate-fade-up-3' },
            { label: 'Avg Reviews',     value: Math.round(s.avgReviews),       color: 'var(--violet)',icon: '⭐', animClass: 'animate-fade-up animate-fade-up-4' },
            { label: 'Avg Rating',      value: (s.avgRating || 0).toFixed(1) + '⭐', color: 'var(--amber)', icon: '🌟', animClass: 'animate-fade-up animate-fade-up-5' },
            { label: 'New Winners',     value: s.newWinners, sub: 'sellers <12mo', color: 'var(--green)', icon: '🚀', animClass: 'animate-fade-up animate-fade-up-6' },
            { label: 'FBA Sellers',     value: s.fbaCount,                     color: 'var(--sky)',   icon: '📬', animClass: 'animate-fade-up' },
            { label: 'Sponsored %',     value: fmtPct(s.sponsoredPct || 0, 0), color: 'var(--red)',   icon: '📢', animClass: 'animate-fade-up' },
          ].map(kpi => <StatCard key={kpi.label} {...kpi} />)}
        </div>
      </div>

      <div className="section-divider" />

      {/* Charts row */}
      <div className="page-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card animate-fade-up p-6">
            <div className="font-mono text-[10px] tracking-[2px] uppercase mb-4" style={{ color: 'var(--sub)' }}>Market Share by Brand</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={82} innerRadius={36} dataKey="value"
                  label={({ name, share }) => `${share}%`} labelLine={false} fontSize={10}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card animate-fade-up animate-fade-up-1 p-6">
            <div className="font-mono text-[10px] tracking-[2px] uppercase mb-4" style={{ color: 'var(--sub)' }}>Price Distribution</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priceDistData} barSize={26}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="range" tick={{ fill: 'var(--sub)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--sub)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="var(--amber)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Review distribution */}
      <div className="page-section">
        <div className="card animate-fade-up p-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <div className="font-mono text-[10px] tracking-[2px] uppercase" style={{ color: 'var(--sub)' }}>Review Count Distribution — Competitive Moat Map</div>
            <div className="flex gap-2.5 flex-wrap">
              <span className="badge badge-green">0-50 = easy entry</span>
              <span className="badge badge-amber">51-200 = manageable</span>
              <span className="badge badge-red">500+ = hard</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={reviewDist} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="range" tick={{ fill: 'var(--sub)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--sub)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                {reviewDist.map((_, i) => <Cell key={i} fill={i === 0 ? '#0a7a4a' : i === 1 ? '#c97a00' : '#c02535'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section-divider" />

      {/* Top sellers table */}
      <div className="card animate-fade-up overflow-hidden">
        <div className="py-4 px-6 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="font-mono text-[10px] tracking-[2px] uppercase" style={{ color: 'var(--sub)' }}>Top Brands by Revenue</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px] min-w-[600px]">
            <thead>
              <tr style={{ background: 'var(--s2)', borderBottom: '1px solid var(--border)' }}>
                {['#', 'Brand', 'Revenue/mo', 'Units/mo', 'Market Share', ''].map(h => (
                  <th key={h} className="py-2.5 px-4 text-left font-mono text-[10px] tracking-[1px] uppercase font-medium" style={{ color: 'var(--sub)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topSellers.map((sel, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-[11px] px-4 font-mono text-xs" style={{ color: 'var(--muted)' }}>#{i + 1}</td>
                  <td className="py-[11px] px-4 font-semibold" style={{ color: 'var(--ink2)' }}>{sel.name}</td>
                  <td className="py-[11px] px-4 font-mono font-semibold" style={{ color: 'var(--amber)' }}>{fmtINR(sel.revenue)}</td>
                  <td className="py-[11px] px-4 font-mono" style={{ color: 'var(--sky)' }}>{fmtNum(sel.units)}</td>
                  <td className="py-[11px] px-4 font-mono font-bold" style={{ color: 'var(--ink)' }}>{sel.share.toFixed(1)}%</td>
                  <td className="py-[11px] px-4 min-w-[120px]">
                    <div className="h-[5px] rounded-[3px] overflow-hidden" style={{ background: 'var(--s3)' }}>
                      <div className="h-full rounded-[3px] transition-[width] duration-[600ms] ease-out" style={{ width: `${Math.min(100, sel.share)}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
