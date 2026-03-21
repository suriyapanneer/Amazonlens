import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout({ opportunityScore, verdict }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar opportunityScore={opportunityScore} verdict={verdict} />
      <main
        className="app-main transition-all duration-300 min-h-screen overflow-x-hidden"
        style={{ marginLeft: '240px' }}
      >
        <Outlet />
      </main>
    </div>
  );
}
