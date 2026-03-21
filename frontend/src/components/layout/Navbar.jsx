import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { vColor, vBg } from '../../lib/format';
import { Upload, BarChart3, Swords, Search, Database, Zap, DollarSign, TrendingUp, FileText, Sparkles, HardDrive, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/upload',      label: 'Upload',      icon: Upload },
  { to: '/dashboard',   label: 'Market',      icon: BarChart3 },
  { to: '/competitors', label: 'Competitors', icon: Swords },
  { to: '/keywords',    label: 'Keywords',    icon: Search },
  { to: '/products',    label: 'Products DB', icon: Database },
  { to: '/compare',     label: 'Compare',     icon: Zap },
  { to: '/profit',      label: 'Profit',      icon: DollarSign },
  { to: '/forecast',    label: 'Forecast',    icon: TrendingUp },
  { to: '/reports',     label: 'Reports',     icon: FileText },
  { to: '/ai-insights', label: 'AI Insights', icon: Sparkles },
  { to: '/storage',     label: 'Storage',     icon: HardDrive },
];

export default function Navbar({ opportunityScore, verdict }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav
      className="app-sidebar fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300"
      style={{ width: '240px' }}
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--glass-border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 max-md:px-0 max-md:justify-center py-6 shrink-0">
        <div
          className="w-[34px] h-[34px] rounded-xl flex items-center justify-center text-[15px] font-extrabold text-white shrink-0"
          style={{
            background: 'linear-gradient(145deg, var(--amber), #c97a00)',
            boxShadow: '0 4px 16px rgba(240,160,48,.35)',
          }}
        >
          A
        </div>
        <span
          className="font-sora font-extrabold text-[15px] tracking-tight whitespace-nowrap max-md:hidden"
          style={{ color: 'var(--ink2)' }}
        >
          Amazon<span style={{ color: 'var(--amber)' }}>Lens</span>
        </span>
      </div>

      {/* Divider */}
      <div className="mx-4 max-md:mx-2 divider shrink-0" />

      {/* Nav links */}
      <div
        className="flex flex-col gap-1 flex-1 overflow-y-auto px-3 max-md:px-1.5 py-4"
        style={{ scrollbarWidth: 'none' }}
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 max-md:justify-center px-4 max-md:px-0 py-[10px] rounded-xl text-[13px] font-medium transition-all duration-200 ${
                isActive ? 'font-bold' : 'hover:bg-[var(--s2)]'
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--amber)' : 'var(--sub)',
              background: isActive ? 'rgba(240,160,48,.1)' : undefined,
              boxShadow: isActive
                ? '0 0 20px rgba(240,160,48,.12), inset 0 0 20px rgba(240,160,48,.05)'
                : undefined,
            })}
          >
            {({ isActive }) => (
              <>
                {/* Active left accent bar */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full max-md:hidden"
                    style={{ background: 'var(--amber)', boxShadow: '0 0 8px var(--amber)' }}
                  />
                )}
                <Icon size={18} className="shrink-0" />
                <span className="max-md:hidden">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom section */}
      <div className="shrink-0 px-3 max-md:px-1.5 pb-4 flex flex-col gap-3">
        {/* Divider */}
        <div className="mx-1 divider" />

        {/* Opportunity score badge */}
        {opportunityScore !== undefined && (
          <div
            className="rounded-xl px-3 max-md:px-1.5 py-3 flex items-center gap-3 max-md:flex-col max-md:gap-1"
            style={{
              background: vBg(verdict),
              border: `1px solid ${vColor(verdict)}30`,
              boxShadow: `0 0 20px ${vColor(verdict)}10`,
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-extrabold font-mono shrink-0"
              style={{
                background: 'rgba(0,0,0,.3)',
                border: `2px solid ${vColor(verdict)}`,
                color: vColor(verdict),
              }}
            >
              {opportunityScore}
            </div>
            <div className="max-md:hidden">
              <div className="text-[10px] font-medium leading-none" style={{ color: 'var(--sub)' }}>
                Score
              </div>
              <div className="text-[13px] font-bold leading-snug" style={{ color: vColor(verdict) }}>
                {verdict}
              </div>
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 max-md:justify-center px-4 max-md:px-0 py-[10px] rounded-xl text-[13px] font-medium transition-all duration-200 w-full hover:bg-[var(--s2)]"
          style={{ color: 'var(--sub)' }}
          title="Sign out"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="max-md:hidden">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
