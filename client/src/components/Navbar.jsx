import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function Logo({ light = false }) {
  return (
    <Link to="/" className={`logo ${light ? 'logo-light' : ''}`} aria-label="StayEase home">
      <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#c9a24d" /><path d="M14 46V28l18-12 18 12v18h-9V32H23v14z" fill="#10243e" /></svg>
      <span>Stay<em>Ease</em></span>
    </Link>
  );
}

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setOpen(false); setMenu(false); }, [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const doLogout = async () => {
    await logout();
    toast.success('You have been logged out.');
    navigate('/');
  };

  const overHero = location.pathname === '/' && !scrolled;

  return (
    <header className={`navbar ${overHero ? 'navbar-transparent' : ''}`}>
      <div className="container navbar-inner">
        <Logo light />
        <button type="button" className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Toggle navigation menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Main navigation">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/rooms">Rooms</NavLink>
          <Link to="/#amenities">Amenities</Link>
          <Link to="/#contact">Contact</Link>
          {user && <NavLink to="/my-bookings">My Bookings</NavLink>}
          <div className="nav-auth">
            {!user && (<>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-gold btn-sm">Sign up</Link>
            </>)}
            {user && (
              <div className="user-menu">
                <button type="button" className="user-menu-btn" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-haspopup="menu">
                  <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
                  <span className="user-name">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={16} aria-hidden="true" />
                </button>
                {menu && (
                  <div className="user-dropdown" role="menu">
                    {isAdmin && <Link to="/admin" role="menuitem"><LayoutDashboard size={16} /> Admin dashboard</Link>}
                    <Link to="/profile" role="menuitem"><User size={16} /> My profile</Link>
                    <Link to="/my-bookings" role="menuitem"><User size={16} /> My bookings</Link>
                    <button type="button" onClick={doLogout} role="menuitem"><LogOut size={16} /> Log out</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
