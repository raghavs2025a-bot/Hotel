import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, BedDouble, CalendarCheck, Globe, LayoutDashboard, LogOut, Menu, Tags, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Logo } from '../components/Navbar.jsx';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/reservations', label: 'Reservations', icon: CalendarCheck },
  { to: '/admin/rooms', label: 'Rooms', icon: BedDouble },
  { to: '/admin/room-types', label: 'Room types', icon: Tags },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${open ? 'open' : ''}`} aria-label="Admin navigation">
        <div className="admin-brand"><Logo light /><span className="admin-tag">Admin</span></div>
        <nav>
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}><Icon size={18} aria-hidden="true" /> {label}</NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <Link to="/"><Globe size={18} aria-hidden="true" /> View website</Link>
          <button type="button" onClick={async () => { await logout(); navigate('/login'); }}><LogOut size={18} aria-hidden="true" /> Log out</button>
        </div>
      </aside>
      {open && <div className="admin-overlay" onClick={() => setOpen(false)} />}
      <div className="admin-main">
        <header className="admin-topbar">
          <button type="button" className="icon-btn admin-menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Toggle admin menu">{open ? <X size={22} /> : <Menu size={22} />}</button>
          <div className="admin-user"><span className="avatar">{user.name.charAt(0)}</span><div><strong>{user.name}</strong><small>Administrator</small></div></div>
        </header>
        <div className="admin-content"><Outlet /></div>
      </div>
    </div>
  );
}
