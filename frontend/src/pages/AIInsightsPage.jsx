import { useState } from 'react';
import { api } from '../lib/api';
import { Sparkles, TrendingUp, AlertTriangle, Target, DollarSign, Search, Lightbulb, Shield, Clock, Zap } from 'lucide-react';

const SECTION_ICONS = {
  verdict: { icon: Target, color: 'var(--amber)', bg: 'var(--amber-bg)' },
  opportunities: { icon: Lightbulb, color: 'var(--green)', bg: 'var(--green-bg)' },
  risks: { icon: AlertTriangle, color: 'var(--red)', bg: 'var(--red-bg)' },
  pricingStrategy: { icon: DollarSign, color: 'var(--sky)', bg: 'var(--sky-bg)' },
  keywordStrategy: { icon: Search, color: 'var(--violet)', bg: 'var(--violet-bg)' },
  differentiators: { icon: Shield, color: 'var(--amber)', bg: 'var(--amber-bg)' },
  estimatedTimeToProfit: { icon: Clock, color: 'var(--green)', bg: 'var(--green-bg)' },
  competitiveAdvantage: { icon: Zap, color: 'var(--sky)', bg: 'var(--sky-bg)' },
};

function InsightCard({ title, icon: Icon, color, bg, children, delay = 0 }) {
  return (
    <div className="card animate-fade-up p-6" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg, color }}>
          <Icon size={18} />
        </div>
        <h3 className="font-sora text-base font-bold text-[var(--ink2)]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ListItems({ items, color }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
          <span className="font-mono text-xs font-bold mt-0.5 shrink-0" style={{ color }}>#{i + 1}</span>
          <p className="text-sm text-[var(--ink2)] leading-relaxed">{item}</p>
        </div>
      ))}
    </div>
  );
}

export default function AIInsightsPage() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    setInsights(null);
    try {
      const r = await api.getMarketInsights({});
      if (r.insights) {
        setInsights(r.insights);
      } else {
        setError(r.message || 'AI insights not available yet.');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header animate-fade-up">
        <div className="page-subtitle">AI Intelligence</div>
        <div className="flex justify-between items-end flex-wrap gap-3">
          <div>
            <h1 className="page-title">AI-Powered Insights</h1>
            <p className="text-sm mt-1 text-[var(--sub)]">Get intelligent product recommendations powered by Claude</p>
          </div>
          <button onClick={generate} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(145deg,#7040b0,#5a30a0)', boxShadow: '0 8px 32px rgba(112,64,176,.22)' }}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Analysing…
              </>
            ) : (
              <><Sparkles size={16} /> Generate Insights</>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="page-section">
          <div className="animate-fade-up card p-6" style={{ background: 'var(--violet-bg)', border: '1px solid rgba(112,64,176,.2)' }}>
            <div className="flex items-start gap-3">
              <Sparkles size={24} className="shrink-0" style={{ color: 'var(--violet)' }} />
              <div>
                <h3 className="font-sora text-lg font-bold mb-2 text-[var(--violet)]">AI Insights Setup Required</h3>
                <p className="text-sm leading-relaxed text-[var(--sub)] mb-4">{error}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: Target, label: 'Market Entry Verdicts', desc: 'AI analysis on whether to enter a market' },
                    { icon: TrendingUp, label: 'Opportunity Spotting', desc: 'Identify the best product opportunities' },
                    { icon: DollarSign, label: 'Pricing Strategy', desc: 'AI-recommended pricing in INR' },
                    { icon: Search, label: 'Keyword Strategy', desc: 'Intelligent keyword prioritization' },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="card p-4">
                      <Icon size={18} className="mb-2" style={{ color: 'var(--violet)' }} />
                      <div className="text-xs font-bold mb-0.5 text-[var(--ink2)]">{label}</div>
                      <div className="text-[11px] text-[var(--sub)]">{desc}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-4 text-[var(--muted)]">
                  Set CLAUDE_API_KEY or ANTHROPIC_API_KEY in your backend .env file to enable AI insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {insights && (
        <div className="page-section-lg">
          <div className="grid gap-4">
            {/* Verdict */}
            {insights.verdict && (
              <InsightCard title="Market Entry Verdict" {...SECTION_ICONS.verdict} delay={0}>
                <p className="text-sm leading-relaxed text-[var(--ink2)]">{insights.verdict}</p>
              </InsightCard>
            )}

            {/* Opportunities & Risks side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.opportunities?.length > 0 && (
                <InsightCard title="Top Opportunities" {...SECTION_ICONS.opportunities} delay={60}>
                  <ListItems items={insights.opportunities} color="var(--green)" />
                </InsightCard>
              )}
              {insights.risks?.length > 0 && (
                <InsightCard title="Risk Factors" {...SECTION_ICONS.risks} delay={120}>
                  <ListItems items={insights.risks} color="var(--red)" />
                </InsightCard>
              )}
            </div>

            {/* Pricing & Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.pricingStrategy && (
                <InsightCard title="Pricing Strategy" {...SECTION_ICONS.pricingStrategy} delay={180}>
                  <p className="text-sm leading-relaxed text-[var(--ink2)]">{insights.pricingStrategy}</p>
                </InsightCard>
              )}
              {insights.keywordStrategy && (
                <InsightCard title="Keyword Strategy" {...SECTION_ICONS.keywordStrategy} delay={240}>
                  <p className="text-sm leading-relaxed text-[var(--ink2)]">{insights.keywordStrategy}</p>
                </InsightCard>
              )}
            </div>

            {/* Differentiators */}
            {insights.differentiators?.length > 0 && (
              <InsightCard title="Key Differentiators" {...SECTION_ICONS.differentiators} delay={300}>
                <ListItems items={insights.differentiators} color="var(--amber)" />
              </InsightCard>
            )}

            {/* Time to Profit & Competitive Advantage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.estimatedTimeToProfit && (
                <InsightCard title="Time to Profitability" {...SECTION_ICONS.estimatedTimeToProfit} delay={360}>
                  <p className="text-sm leading-relaxed text-[var(--ink2)]">{insights.estimatedTimeToProfit}</p>
                </InsightCard>
              )}
              {insights.competitiveAdvantage && (
                <InsightCard title="Competitive Advantage" {...SECTION_ICONS.competitiveAdvantage} delay={420}>
                  <p className="text-sm leading-relaxed text-[var(--ink2)]">{insights.competitiveAdvantage}</p>
                </InsightCard>
              )}
            </div>
          </div>
        </div>
      )}

      {!insights && !error && !loading && (
        <div className="page-section-lg">
          <div className="text-center py-20 animate-fade-up">
            <Sparkles size={52} strokeWidth={1} className="mx-auto mb-4 text-[var(--muted)]" />
            <div className="font-sora text-lg sm:text-xl font-bold mb-2 text-[var(--ink)]">Ready to analyse</div>
            <p className="text-sm text-[var(--sub)]">
              Upload your Helium 10 data first, then click "Generate Insights" to get AI-powered recommendations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
