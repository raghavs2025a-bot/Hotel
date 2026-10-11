import { Link } from 'react-router-dom';
import { BedDouble, CalendarCheck, DoorClosed, DoorOpen, IndianRupee, LogIn, LogOut, Users, Wrench } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge.jsx';
import { ErrorState, Loader } from '../../components/feedback.jsx';
import useFetch from '../../hooks/useFetch.js';
import { adminService } from '../../services/index.js';
import { formatDate, formatINR, formatINRPrecise } from '../../utils/format.js';

function Stat({ icon: Icon, label, value, tone = '' }) {
  return (
    <div className={`stat-card ${tone}`}>
      <span className="stat-icon"><Icon size={22} aria-hidden="true" /></span>
      <div><small>{label}</small><strong>{value}</strong></div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, loading, error, reload } = useFetch(() => adminService.stats(), []);
  if (loading) return <Loader label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const s = data.stats;

  return (
    <>
      <div className="admin-head"><h1>Dashboard</h1><p className="muted">Live overview of rooms, reservations and revenue.</p></div>
      <div className="stat-grid">
        <Stat icon={BedDouble} label="Total rooms" value={s.rooms.total} />
        <Stat icon={DoorOpen} label="Available now" value={s.rooms.available} tone="tone-green" />
        <Stat icon={DoorClosed} label="Occupied" value={s.rooms.occupied} tone="tone-blue" />
        <Stat icon={Wrench} label="Under maintenance" value={s.rooms.maintenance} tone="tone-amber" />
        <Stat icon={CalendarCheck} label="Total reservations" value={s.reservations.total} />
        <Stat icon={IndianRupee} label="Revenue (all time)" value={formatINR(s.revenue.total)} tone="tone-gold" />
        <Stat icon={IndianRupee} label="Revenue (this month)" value={formatINR(s.revenue.thisMonth)} tone="tone-gold" />
        <Stat icon={Users} label="Customers" value={s.customers} />
      </div>

      <div className="admin-two">
        <section className="panel">
          <h2>Reservations by status</h2>
          <ul className="status-bars">
            {Object.entries(s.reservations.byStatus).map(([k, v]) => (
              <li key={k}>
                <StatusBadge status={k} />
                <div className="bar"><span className={`bar-fill bar-${k}`} style={{ width: `${s.reservations.total ? (v / s.reservations.total) * 100 : 0}%` }} /></div>
                <strong>{v}</strong>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h2>Today&apos;s operations</h2>
          <h3 className="mini-h"><LogIn size={16} /> Arrivals ({s.todayArrivals.length})</h3>
          {s.todayArrivals.length === 0 ? <p className="muted small">No arrivals pending today.</p> : (
            <ul className="mini-list">{s.todayArrivals.map((b) => <li key={b.id}><strong>{b.guest_name}</strong> &middot; {b.room_name} #{b.room_number} <StatusBadge status={b.status} /></li>)}</ul>
          )}
          <h3 className="mini-h"><LogOut size={16} /> Departures ({s.todayDepartures.length})</h3>
          {s.todayDepartures.length === 0 ? <p className="muted small">No departures expected today.</p> : (
            <ul className="mini-list">{s.todayDepartures.map((b) => <li key={b.id}><strong>{b.guest_name}</strong> &middot; {b.room_name} #{b.room_number}</li>)}</ul>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-head"><h2>Recent reservations</h2><Link to="/admin/reservations" className="link-btn">View all</Link></div>
        {s.recentBookings.length === 0 ? <p className="muted">No reservations yet.</p> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Reference</th><th>Guest</th><th>Room</th><th>Stay</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {s.recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td data-label="Reference"><strong>{b.reference}</strong></td>
                    <td data-label="Guest">{b.guest_name}</td>
                    <td data-label="Room">{b.room_name}</td>
                    <td data-label="Stay">{formatDate(b.check_in)} &rarr; {formatDate(b.check_out)}</td>
                    <td data-label="Total">{formatINRPrecise(b.total_amount)}</td>
                    <td data-label="Status"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
