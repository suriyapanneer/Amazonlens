import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fmtINR, fmtNum } from '../lib/format';
import { exportTableCSV } from '../lib/export';
import CustomTooltip from '../components/charts/CustomTooltip';

const Empty = ({ onUpload }) => (
  <div className="text-center px-5 py-24">
    <div className="text-[52px] mb-4 animate-float">🔮</div>
    <div className="font-sora text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>No forecast data</div>
    <p className="text-sm mb-6" style={{ color: 'var(--sub)' }}>Upload Xray data and run the Profit Calculator first</p>
    <button className="btn btn-amber" onClick={onUpload}>← Go to Upload</button>
  </div>
);

export default function ForecastPage({ analysis, xrayData, costs }) {
  const [scenario, setScenario] = useState('base');

  if (!analysis?.forecast?.length || !xrayData) {
    return <Empty onUpload={() => {}} />;
  }

  const raw = analysis.forecast;

  // Scenario multipliers
  const multipliers = { pessimistic: 0.65, base: 1.0, optimistic: 1.4 };
  const m = multipliers[scenario];
  const forecast = raw.map(r => ({
    month: r.month,
    revenue: Math.round(r.revenue * m),
    units:   Math.round(r.units * m),
    profit:  Math.round(r.profit * m),
  }));

  // Cumulative
  let cumRev = 0, cumPro = 0;
  const cumData = forecast.map(r => {
    cumRev += r.revenue; cumPro += r.profit;
    return { ...r, cumRevenue: cumRev, cumProfit: cumPro };
  });

  const totalRev    = forecast.reduce((a, r) => a + r.revenue, 0);
  const totalProfit = forecast.reduce((a, r) => a + r.profit, 0);
  const totalUnits  = forecast.reduce((a, r) => a + r.units, 0);
  const bestMonth   = [...forecast].sort((a, b) => b.revenue - a.revenue)[0];
  const roi         = costs ? ((totalProfit / (costs.firstOrder * costs.cogs)) * 100).toFixed(0) : null;

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();

  const exportRows = cumData.map((r, i) => ({
    month: `Month ${r.month}`,
    revenue: r.revenue,
    units: r.units,
    profit: r.profit,
    cumulative_revenue: r.cumRevenue,
    cumulative_profit: r.cumProfit,
  }));

  return (
    <div className="page-container">
      <div className="page-header animate-fade-up flex flex-wrap justify-between items-end gap-3">
        <div>
          <div className="page-subtitle">12-Month Projection</div>
          <h1 className="page-title">Revenue Forecast</h1>
        </div>
        <button className="btn btn-outline text-xs" onClick={() => exportTableCSV(exportRows, Object.keys(exportRows[0]), 'forecast')}>↓ Export CSV</button>
      </div>

      {/* Scenario toggle */}
      <div className="page-section">
        <div className="animate-fade-up animate-fade-up-1 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold self-center" style={{ color: 'var(--sub)' }}>Scenario:</span>
          {[['pessimistic', '🌧️ Pessimistic (-35%)'], ['base', '📊 Base Case'], ['optimistic', '🚀 Optimistic (+40%)']].map(([s, l]) => (
            <button key={s} onClick={() => setScenario(s)} className={`btn${scenario === s ? ' btn-amber' : ' btn-outline'} px-4 py-[7px] text-xs`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="section-divider" />

      {/* KPI row */}
      <div className="page-section">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: '12M Total Revenue', v: fmtINR(totalRev),    c: 'var(--amber)', icon: '💰' },
            { l: '12M Total Profit',  v: fmtINR(totalProfit), c: 'var(--green)', icon: '📈' },
            { l: 'Total Units',       v: fmtNum(totalUnits),  c: 'var(--sky)',   icon: '📦' },
            { l: 'Projected ROI',     v: roi ? `${roi}%` : '—', c: 'var(--violet)', icon: '🎯' },
          ].map((item, i) => (
            <div key={item.l} className={`card animate-fade-up animate-fade-up-${i + 1} relative overflow-hidden px-5 py-4`}>
              <div className="absolute -top-5 -right-5 w-[70px] h-[70px] rounded-full opacity-[.06] pointer-events-none" style={{ background: item.c }} />
              <div className="text-lg mb-2">{item.icon}</div>
              <div className="font-mono text-lg sm:text-xl lg:text-[22px] font-medium leading-none mb-1" style={{ color: item.c }}>{item.v}</div>
              <div className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--sub)' }}>{item.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-divider" />

      {/* Revenue + Profit chart */}
      <div className="page-section">
        <div className="card animate-fade-up p-6">
          <div className="font-mono text-[10px] uppercase tracking-[2px] mb-4" style={{ color: 'var(--sub)' }}>Monthly Revenue & Profit</div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={forecast} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c97a00" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#c97a00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0a7a4a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0a7a4a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--sub)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `M${v}`} />
              <YAxis tick={{ fill: 'var(--sub)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmtINR(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#c97a00" strokeWidth={2} fill="url(#gradRev)" dot={false} activeDot={{ r: 5, fill: '#c97a00' }} />
              <Area type="monotone" dataKey="profit" name="Profit" stroke="#0a7a4a" strokeWidth={2} fill="url(#gradPro)" dot={false} activeDot={{ r: 5, fill: '#0a7a4a' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Units chart */}
      <div className="page-section">
        <div className="card animate-fade-up animate-fade-up-1 p-6">
          <div className="font-mono text-[10px] uppercase tracking-[2px] mb-4" style={{ color: 'var(--sub)' }}>Monthly Units Sold</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={forecast} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradUnits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0762b8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0762b8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--sub)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `M${v}`} />
              <YAxis tick={{ fill: 'var(--sub)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="units" name="Units" stroke="#0762b8" strokeWidth={2} fill="url(#gradUnits)" dot={false} activeDot={{ r: 5, fill: '#0762b8' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section-divider" />

      {/* Monthly table */}
      <div className="page-section">
        <div className="card animate-fade-up animate-fade-up-2 overflow-hidden">
          <div className="flex justify-between items-center px-5 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="font-mono text-[10px] uppercase tracking-[2px]" style={{ color: 'var(--sub)' }}>Monthly Breakdown</span>
            {bestMonth && <span className="badge badge-amber">Peak: Month {bestMonth.month} — {fmtINR(bestMonth.revenue)}</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px] min-w-[600px]">
              <thead>
                <tr style={{ background: 'var(--s2)', borderBottom: '1px solid var(--border)' }}>
                  {['Month', 'Calendar', 'Revenue', 'Units', 'Profit', 'Cum. Revenue', 'Cum. Profit'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider font-medium whitespace-nowrap" style={{ color: 'var(--sub)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cumData.map((r, i) => {
                  const cal = monthNames[(now.getMonth() + i) % 12];
                  const isBreakEven = costs && r.cumProfit >= 0 && (i === 0 || cumData[i - 1].cumProfit < 0);
                  return (
                    <tr key={r.month} style={{ borderBottom: '1px solid var(--border)', background: isBreakEven ? 'rgba(10,122,74,.04)' : 'transparent' }}>
                      <td className="px-4 py-2.5 font-mono font-semibold" style={{ color: 'var(--sub)' }}>M{r.month}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--sub)' }}>{cal} {now.getFullYear() + Math.floor((now.getMonth() + i) / 12)}</td>
                      <td className="px-4 py-2.5 font-mono font-semibold" style={{ color: 'var(--amber)' }}>{fmtINR(r.revenue)}</td>
                      <td className="px-4 py-2.5 font-mono" style={{ color: 'var(--sky)' }}>{fmtNum(r.units)}</td>
                      <td className="px-4 py-2.5 font-mono font-semibold" style={{ color: r.profit > 0 ? 'var(--green)' : 'var(--red)' }}>{fmtINR(r.profit)}</td>
                      <td className="px-4 py-2.5 font-mono" style={{ color: 'var(--ink)' }}>{fmtINR(r.cumRevenue)}</td>
                      <td className="px-4 py-2.5 font-mono" style={{ color: r.cumProfit >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: r.cumProfit >= 0 ? 700 : 400 }}>
                        {fmtINR(r.cumProfit)}
                        {isBreakEven && <span className="badge badge-green ml-2 text-[9px]">Break-even! 🎉</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
