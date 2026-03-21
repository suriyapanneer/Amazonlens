export default function StatCard({ label, value, sub, color = 'var(--amber)', icon, className = 'animate-fade-up' }) {
  return (
    <div className={`rounded-2xl p-5 relative overflow-hidden transition-all hover:-translate-y-0.5 ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 2px 0 rgba(255,255,255,.8),0 4px 16px rgba(0,0,0,.07),0 2px 6px rgba(0,0,0,.04)' }}>
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none" style={{ background: color, opacity: .06 }} />
      {icon && <div className="text-xl mb-2.5">{icon}</div>}
      <div className="font-mono text-2xl font-medium leading-none mb-1.5" style={{ color }}>{value}</div>
      <div className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: 'var(--sub)' }}>{label}</div>
      {sub && <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>{sub}</div>}
    </div>
  );
}
