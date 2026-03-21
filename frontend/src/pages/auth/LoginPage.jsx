import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/upload');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex" style={{
        flex: '1 1 50%',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3.5rem',
      }}>
        {/* Floating orbs */}
        <div className="orb orb-amber animate-float" style={{ width: 260, height: 260, top: '8%', left: '10%', opacity: 0.5 }} />
        <div className="orb orb-violet animate-float" style={{ width: 180, height: 180, bottom: '12%', right: '8%', opacity: 0.4, animationDelay: '2s' }} />
        <div className="orb orb-green animate-float" style={{ width: 100, height: 100, top: '55%', left: '55%', opacity: 0.3, animationDelay: '4s' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div className="animate-fade-up" style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', fontWeight: 800, color: '#fff',
                background: 'linear-gradient(145deg,#e8920c,#c97a00)',
                boxShadow: '0 8px 32px rgba(201,122,0,.4)',
              }}>A</div>
              <span className="font-sora" style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--ink2)' }}>
                Amazon<span style={{ color: 'var(--amber)' }}>Lens</span>
              </span>
            </div>
            <h2 className="font-sora" style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, color: 'var(--ink2)', marginBottom: '0.75rem' }}>
              Product Intelligence<br />for Amazon Sellers
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--sub)', maxWidth: 400, lineHeight: 1.6 }}>
              Unlock data-driven insights to grow your Amazon business with confidence.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="animate-fade-up-1" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { icon: <TrendingUp size={20} />, label: 'Real-time trend analysis', color: 'var(--amber)' },
              { icon: <Shield size={20} />, label: 'AI-powered review insights', color: 'var(--green)' },
              { icon: <Zap size={20} />, label: 'Instant competitive intelligence', color: 'var(--violet)' },
              { icon: <BarChart3 size={20} />, label: 'Advanced analytics dashboard', color: 'var(--sky)' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--glass)', border: '1px solid var(--glass-border)',
                  color: f.color,
                  backdropFilter: 'blur(12px)',
                }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)' }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: '1 1 50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Mobile orbs */}
        <div className="orb orb-amber animate-float lg:hidden" style={{ width: 140, height: 140, top: '5%', right: '-30px', opacity: 0.35 }} />
        <div className="orb orb-violet animate-float lg:hidden" style={{ width: 100, height: 100, bottom: '10%', left: '-20px', opacity: 0.25, animationDelay: '3s' }} />

        <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
          {/* Mobile logo */}
          <div className="lg:hidden animate-fade-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.125rem', fontWeight: 800, color: '#fff',
                background: 'linear-gradient(145deg,#e8920c,#c97a00)',
                boxShadow: '0 8px 24px rgba(201,122,0,.35)',
              }}>A</div>
              <span className="font-sora" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--ink2)' }}>
                Amazon<span style={{ color: 'var(--amber)' }}>Lens</span>
              </span>
            </div>
          </div>

          {/* Glass card */}
          <div className="card card-glow animate-fade-up" style={{
            padding: '2.5rem',
            borderRadius: '1.25rem',
            background: 'var(--glass)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 8px 40px rgba(0,0,0,.25), 0 0 80px rgba(232,146,12,.06)',
          }}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 className="font-sora" style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--ink2)', marginBottom: '0.375rem' }}>
                Welcome back
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--sub)' }}>Sign in to your product research dashboard</p>
            </div>

            {error && (
              <div style={{
                marginBottom: '1.25rem', padding: '0.875rem 1rem', borderRadius: 12,
                fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(192,37,53,.2)',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="font-mono" style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sub)', marginBottom: '0.5rem' }}>
                  Email
                </label>
                <div className="input-glass" style={{ display: 'flex', alignItems: 'center', borderRadius: 12, overflow: 'hidden' }}>
                  <span style={{ padding: '0.875rem 0.875rem', color: 'var(--muted)', display: 'flex' }}><Mail size={18} /></span>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '0.875rem 0.875rem 0.875rem 0', fontSize: '0.9375rem', fontWeight: 500, color: 'var(--ink)' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <label className="font-mono" style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sub)', marginBottom: '0.5rem' }}>
                  Password
                </label>
                <div className="input-glass" style={{ display: 'flex', alignItems: 'center', borderRadius: 12, overflow: 'hidden' }}>
                  <span style={{ padding: '0.875rem 0.875rem', color: 'var(--muted)', display: 'flex' }}><Lock size={18} /></span>
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '0.875rem 0.875rem 0.875rem 0', fontSize: '0.9375rem', fontWeight: 500, color: 'var(--ink)' }} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ padding: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex' }}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-amber" style={{
                width: '100%', padding: '0.9375rem', borderRadius: 14,
                fontSize: '0.9375rem', fontWeight: 700, color: '#fff', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(145deg,#e8920c,#c97a00)',
                boxShadow: '0 8px 32px rgba(201,122,0,.28), 0 0 60px rgba(232,146,12,.1)',
                opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
              }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%' }} className="animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="divider" style={{ margin: '1.75rem 0' }} />

            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--sub)' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ fontWeight: 700, color: 'var(--amber)', textDecoration: 'none' }}>Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
