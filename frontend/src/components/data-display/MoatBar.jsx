export default function MoatBar({ score }) {
  const color = score < 35 ? 'var(--green)' : score < 60 ? 'var(--amber)' : 'var(--red)';
  const label = score < 35 ? 'Beatable' : score < 60 ? 'Moderate' : 'Strong';
  const bg = score < 35 ? 'var(--green-bg)' : score < 60 ? 'var(--amber-bg)' : 'var(--red-bg)';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-[5px] rounded-sm overflow-hidden" style={{ background: 'var(--s3)' }}>
        <div className="h-full rounded-sm transition-[width] duration-500" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold min-w-[74px] justify-center"
        style={{ background: bg, color, border: `1px solid ${color}25` }}>
        {score} {label}
      </span>
    </div>
  );
}
