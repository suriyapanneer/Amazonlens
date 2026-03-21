import { fmtINR } from '../../lib/format';

export default function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[10px] px-3.5 py-2.5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,.09),0 4px 12px rgba(0,0,0,.05)' }}>
      <div className="text-[11px] mb-1" style={{ color: 'var(--sub)' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="font-mono text-[13px] font-semibold" style={{ color: p.color || 'var(--ink)' }}>
          {typeof p.value === 'number' && p.value > 1000 ? fmtINR(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}
