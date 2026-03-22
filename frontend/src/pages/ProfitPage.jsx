import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { fmtINR } from '../lib/format';

// ── Local fee calculation (mirrors backend exactly) ───────────────────────
function amazonFees(sellPrice, weightKg = 0.5) {
  const referral = sellPrice < 1000 ? 0 : parseFloat((sellPrice * 0.10).toFixed(2));
  const closing  = 30;
  const pickPack = 14;
  let weightFee;
  if      (weightKg <= 0.5) weightFee = 44;
  else if (weightKg <= 1.0) weightFee = 58;
  else if (weightKg <= 2.0) weightFee = 90;
  else                      weightFee = 120 + Math.ceil((weightKg - 2) / 0.5) * 20;
  const storage = 6.50;
  return { referral, closing, pickPack, weightFee, storage, total: referral + closing + pickPack + weightFee + storage };
}

function calcProfitLocal(costs) {
  const { sellPrice, cogs, packaging = 0, shipping = 0, ppc = 30, returnRate = 4, weight = 0.5 } = costs;
  const fees       = amazonFees(sellPrice, weight);
  const returnCost = parseFloat((sellPrice * (returnRate / 100)).toFixed(2));
  const gstOut     = parseFloat(((sellPrice - cogs) * 0.18 * 0.55).toFixed(2));
  const totalCost  = cogs + packaging + shipping + fees.total + ppc + returnCost + gstOut;
  const profit     = parseFloat((sellPrice - totalCost).toFixed(2));
  const margin     = parseFloat(((profit / sellPrice) * 100).toFixed(1));
  return { fees, returnCost, gstOut, totalCost, profit, margin };
}
// ─────────────────────────────────────────────────────────────────────────────

function InputRow({ label, name, value, onChange, unit = '₹', hint }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--sub)' }}>{label}</label>
      <div className="flex items-center rounded-lg overflow-hidden shadow-sm" style={{ background: 'var(--s2)', border: '1px solid var(--border2)' }}>
        {unit && <span className="font-mono text-xs px-3 py-2.5 shrink-0" style={{ color: 'var(--sub)', background: 'var(--s3)', borderRight: '1px solid var(--border)' }}>{unit}</span>}
        <input type="number" name={name} value={value} onChange={onChange}
          className="flex-1 bg-transparent border-none px-3 py-2.5 text-sm font-mono font-medium outline-none" style={{ color: 'var(--ink)' }} />
      </div>
      {hint && <div className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>{hint}</div>}
    </div>
  );
}

function SliderRow({ label, name, value, onChange, min, max, step = 1, unit = '' }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--sub)' }}>{label}</label>
        <span className="font-mono text-xs font-semibold" style={{ color: 'var(--amber)' }}>{value}{unit}</span>
      </div>
      <input type="range" name={name} min={min} max={max} step={step} value={value} onChange={onChange} className="w-full" />
      <div className="flex justify-between text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

const DEFAULT = { sellPrice: 399, cogs: 60, packaging: 23, shipping: 31, ppc: 30, returnRate: 4, weight: 0.5, firstOrder: 200 };

export default function ProfitPage({ costs, setCosts, xrayData }) {
  const [mode, setMode] = useState('manual');
  const [products, setProducts] = useState([]);
  const [selAsin, setSelAsin] = useState('');
  const [form, setForm] = useState(costs || DEFAULT);
  const [saved, setSaved] = useState('');
  const [saving, setSaving] = useState(false);

  // Always compute result locally — instant, no API needed
  const result = calcProfitLocal(form);

  // Load products for "from saved" mode
  useEffect(() => {
    api.getProducts().then(r => setProducts(r.products || [])).catch(() => {});
  }, []);

  // Propagate costs up whenever form changes
  useEffect(() => {
    if (setCosts) setCosts(form);
  }, [form]);

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: parseFloat(e.target.value) || 0 }));

  const saveToProduct = async (asin) => {
    if (!asin) return;
    setSaving(true);
    try {
      await api.calcProfit({ ...form, asin });
      setSaved('Saved ✅');
      setTimeout(() => setSaved(''), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const selectProduct = asin => {
    setSelAsin(asin);
    const p = products.find(p => p.asin === asin);
    if (!p) return;
    let prefill = { ...DEFAULT, sellPrice: p.price, cogs: +(p.price * 0.18).toFixed(0), weight: p.weight || 0.5 };
    try { const c = JSON.parse(p.costs_json || 'null'); if (c) prefill = { ...prefill, ...c }; } catch {}
    setForm(prefill);
  };

  const invest    = form.firstOrder * (form.cogs + form.packaging + form.shipping);
  const monthRev  = form.firstOrder * form.sellPrice;
  const monthPro  = form.firstOrder * result.profit;
  const brkEven   = Math.ceil(invest / Math.max(1, result.profit));

  return (
    <div className="page-container">
      <div className="page-header animate-fade-up">
        <div className="page-subtitle">Profit Calculator</div>
        <h1 className="page-title">Real Profit After All Fees</h1>
      </div>

      {/* Mode toggle */}
      <div className="page-section">
        <div className="card-flat animate-fade-up animate-fade-up-1 flex flex-wrap items-center gap-3 p-5">
          <div className="flex gap-1.5">
            {[['manual', '✏️ Manual Entry'], ['system', '🔗 From Saved Product']].map(([m, l]) => (
              <button key={m} onClick={() => setMode(m)} className={`btn${mode === m ? ' btn-amber' : ' btn-outline'} px-4 py-2 text-xs`}>{l}</button>
            ))}
          </div>
          {mode === 'system' && (
            <select value={selAsin} onChange={e => selectProduct(e.target.value)}
              className="flex-1 min-w-0 sm:min-w-[220px] px-3 py-2 rounded-lg text-[13px] cursor-pointer outline-none shadow-sm"
              style={{ background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--ink)' }}>
              <option value="">— Select a saved product —</option>
              {products.map(p => <option key={p.asin} value={p.asin}>{p.title?.slice(0, 48)} ({fmtINR(p.price)})</option>)}
            </select>
          )}
          {mode === 'system' && selAsin && (
            <button className="btn btn-green px-4 py-2 text-xs" onClick={() => saveToProduct(selAsin)} disabled={saving}>
              {saving ? '…' : '💾 Save to Product'}
            </button>
          )}
          {saved && <span className="badge badge-green">{saved}</span>}
        </div>
      </div>

      <div className="section-divider" />

      <div className="page-section">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6">
          {/* ── Inputs ── */}
          <div className="flex flex-col gap-4">
            <div className="card animate-fade-up p-6">
              <div className="font-mono text-[10px] uppercase tracking-[2px] mb-4" style={{ color: 'var(--sub)' }}>Selling</div>
              <div className="flex flex-col gap-3">
                <SliderRow label="Sell Price" name="sellPrice" value={form.sellPrice} onChange={onChange} min={99} max={1999} unit="₹" />
                <div className="px-3 py-2.5 rounded-lg text-[11px] font-semibold"
                  style={{
                    background: form.sellPrice < 1000 ? 'var(--green-bg)' : 'var(--red-bg)',
                    color: form.sellPrice < 1000 ? 'var(--green)' : 'var(--red)',
                    border: `1px solid ${form.sellPrice < 1000 ? 'rgba(10,122,74,.2)' : 'rgba(192,37,53,.2)'}`
                  }}>
                  {form.sellPrice < 1000
                    ? '✅ Under ₹1,000 → 0% Amazon Referral Fee!'
                    : `⚠️ Above ₹1,000 → 10% Referral Fee = ${fmtINR(form.sellPrice * 0.1)}`}
                </div>
              </div>
            </div>

            <div className="card animate-fade-up animate-fade-up-1 p-6">
              <div className="font-mono text-[10px] uppercase tracking-[2px] mb-4" style={{ color: 'var(--sub)' }}>Your Costs</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputRow label="COGS" name="cogs" value={form.cogs} onChange={onChange} hint="IndiaMART buy price" />
                <InputRow label="Packaging" name="packaging" value={form.packaging} onChange={onChange} hint="Box + label + bag" />
                <InputRow label="Inbound Shipping" name="shipping" value={form.shipping} onChange={onChange} hint="Supplier → FBA" />
                <InputRow label="PPC per Unit" name="ppc" value={form.ppc} onChange={onChange} hint="Ad spend ÷ daily orders" />
              </div>
            </div>

            <div className="card animate-fade-up animate-fade-up-2 p-6">
              <div className="font-mono text-[10px] uppercase tracking-[2px] mb-4" style={{ color: 'var(--sub)' }}>Settings</div>
              <div className="flex flex-col gap-3.5">
                <SliderRow label="Return Rate" name="returnRate" value={form.returnRate} onChange={onChange} min={0} max={20} unit="%" />
                <SliderRow label="Weight (kg)" name="weight" value={form.weight} onChange={onChange} min={0.1} max={5} step={0.1} unit="kg" />
                <SliderRow label="First Order Qty" name="firstOrder" value={form.firstOrder} onChange={onChange} min={50} max={1000} step={50} />
              </div>
            </div>
          </div>

          {/* ── Results (always visible) ── */}
          <div className="flex flex-col gap-4">
            {/* Hero */}
            <div className="card animate-fade-up p-7 text-center relative overflow-hidden"
              style={{
                background: result.profit > 0
                  ? 'linear-gradient(135deg,rgba(10,122,74,.06),rgba(10,122,74,.02))'
                  : 'linear-gradient(135deg,rgba(192,37,53,.06),rgba(192,37,53,.02))',
                border: `1px solid ${result.profit > 0 ? 'rgba(10,122,74,.2)' : 'rgba(192,37,53,.2)'}`
              }}>
              <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[14px]"
                style={{ background: `linear-gradient(90deg,${result.profit > 0 ? 'var(--green)' : 'var(--red)'},${result.profit > 0 ? 'var(--green)' : 'var(--red)'}60)` }} />
              <div className="font-mono text-[10px] uppercase tracking-[2px] mb-2" style={{ color: 'var(--sub)' }}>Net Profit per Unit</div>
              <div className="font-mono text-3xl sm:text-4xl lg:text-[54px] font-medium leading-none"
                style={{ color: result.profit > 0 ? 'var(--green)' : 'var(--red)' }}>
                {fmtINR(result.profit)}
              </div>
              <div className="text-xl font-bold mt-2"
                style={{ color: result.profit > 0 ? 'var(--green)' : 'var(--red)' }}>
                {result.margin}% margin
              </div>
              <div className="mt-2.5">
                <span className={`badge ${result.margin >= 40 ? 'badge-green' : result.margin >= 25 ? 'badge-amber' : 'badge-red'}`}>
                  {result.margin >= 40 ? '🔥 Excellent' : result.margin >= 25 ? '✅ Good' : result.margin >= 15 ? '⚠️ Thin' : '❌ Not viable'}
                </span>
              </div>
            </div>

            {/* Fee breakdown */}
            <div className="card animate-fade-up animate-fade-up-1 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[2px] mb-3.5" style={{ color: 'var(--sub)' }}>Cost Breakdown</div>
              {[
                { l: 'Sell Price',       v: form.sellPrice,        plus: true,  c: 'var(--green)' },
                { l: 'Product COGS',     v: form.cogs,              c: 'var(--red)' },
                { l: 'Packaging',        v: form.packaging,         c: 'var(--red)' },
                { l: 'Inbound Shipping', v: form.shipping,          c: 'var(--red)' },
                { l: 'Referral Fee',     v: result.fees.referral,   c: result.fees.referral === 0 ? 'var(--green)' : 'var(--red)', tag: result.fees.referral === 0 ? '₹0 ✅' : null },
                { l: 'Closing Fee',      v: result.fees.closing,    c: 'var(--red)' },
                { l: 'Pick & Pack',      v: result.fees.pickPack,   c: 'var(--red)' },
                { l: 'Weight Handling',  v: result.fees.weightFee,  c: 'var(--red)' },
                { l: 'FBA Storage',      v: result.fees.storage,    c: 'var(--red)' },
                { l: 'PPC',              v: form.ppc,               c: 'var(--red)' },
                { l: 'Returns',          v: result.returnCost,      c: 'var(--red)' },
                { l: 'GST Net',          v: result.gstOut,          c: 'var(--red)' },
              ].map((row, i) => (
                <div key={i} className="flex justify-between py-1.5 text-[12.5px]" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--sub)' }}>{row.l}</span>
                  <span className="font-mono font-bold" style={{ color: row.c }}>
                    {row.tag || `${row.plus ? '+' : '-'}${fmtINR(row.v)}`}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-2.5 text-sm font-extrabold">
                <span style={{ color: 'var(--ink2)' }}>NET PROFIT</span>
                <span className="font-mono" style={{ color: result.profit > 0 ? 'var(--green)' : 'var(--red)' }}>
                  {fmtINR(result.profit)} ({result.margin}%)
                </span>
              </div>
            </div>

            {/* Investment */}
            <div className="card-flat animate-fade-up animate-fade-up-2 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[2px] mb-3" style={{ color: 'var(--sub)' }}>
                Investment ({form.firstOrder} units)
              </div>
              {[
                { l: 'Total Investment',   v: fmtINR(invest),          c: 'var(--amber)' },
                { l: 'Break-even (units)', v: `${brkEven} units`,      c: 'var(--sky)'   },
                { l: 'Monthly Revenue',    v: fmtINR(monthRev),        c: 'var(--green)' },
                { l: 'Monthly Profit',     v: fmtINR(monthPro),        c: result.profit > 0 ? 'var(--green)' : 'var(--red)' },
              ].map((row, i) => (
                <div key={i} className="flex justify-between py-2 text-[13px]" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--sub)' }}>{row.l}</span>
                  <span className="font-mono font-bold" style={{ color: row.c }}>{row.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
