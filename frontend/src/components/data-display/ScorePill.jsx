import { vColor, vBg } from '../../lib/format';

export default function ScorePill({ score, verdict }) {
  const c = vColor(verdict);
  const bg = vBg(verdict);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[11px] font-bold"
      style={{ background: bg, color: c, border: `1px solid ${c}25` }}>
      {score} {verdict}
    </span>
  );
}
