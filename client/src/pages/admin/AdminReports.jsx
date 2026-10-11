import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge.jsx';
import { ErrorState, Loader } from '../../components/feedback.jsx';
import useFetch from '../../hooks/useFetch.js';
import { adminService } from '../../services/index.js';
import { addDaysISO, formatDate, formatINR, todayISO } from '../../utils/format.js';

const PRESETS = [['Last 7 days', 6], ['Last 30 days', 29], ['Last 90 days', 89]];

function Bars({ rows, valueKey, format, label }) {
  const max = Math.max(1, ...rows.map((r) => r[valueKey]));
  return (
    <div className="chart" role="img" aria-label={label}>
      {rows.map((r) => (
        <div className="chart-col" key={r.day} title={`${formatDate(r.day)}: ${format(r[valueKey])}`}>
          <span style={{ height: `${(r[valueKey] / max) * 100}%` }} />
        </div>
      ))}
    </div>
  );
}

export default function AdminReports() {
  const [range, setRange] = useState({ from: addDaysISO(todayISO(), -29), to: todayISO() });
  const [draft, setDraft] = useState(range);
  const { data, loading, error, reload } = useFetch(() => adminService.report(range), [range.from, range.to]);

  const apply = (e) => { e.preventDefault(); if (draft.from && draft.to) setRange(draft); };
  const preset = (days) => { const r = { from: addDaysISO(todayISO(), -days), to: todayISO() }; setDraft(r); setRange(r); };
  const r = data?.report;

  return (
    <>
      <div className="admin-head"><h1>Reports</h1><p className="muted">Booking, occupancy and revenue for a selected date range.</p></div>
      <form className="toolbar toolbar-wrap" onSubmit={apply}>
        <label className="inline-field">From <input type="date" value={draft.from} max={draft.to} onChange={(e) => setDraft({ ...draft, from: e.target.value })} required /></label>
        <label className="inline-field">To <input type="date" value={draft.to} min={draft.from} onChange={(e) => setDraft({ ...draft, to: e.target.value })} required /></label>
        <button type="submit" className="btn btn-primary btn-sm"><BarChart3 size={16} /> Generate</button>
        {PRESETS.map(([l, d]) => <button key={l} type="button" className="btn btn-outline btn-sm" onClick={() => preset(d)}>{l}</button>)}
      </form>

      {loading && <Loader label="Building report..." />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {r && !loading && (
        <>
          <div className="stat-grid">
            <div className="stat-card"><div><small>Bookings created</small><strong>{r.summary.totalBookings}</strong></div></div>
            <div className="stat-card tone-gold"><div><small>Net revenue</small><strong>{formatINR(r.summary.revenue)}</strong></div></div>
            <div className="stat-card tone-blue"><div><small>Average occupancy</small><strong>{r.summary.averageOccupancyPct}%</strong></div></div>
            <div className="stat-card"><div><small>Room-nights sold</small><strong>{r.summary.nightsSold}</strong></div></div>
            <div className="stat-card tone-amber"><div><small>Cancellations</small><strong>{r.summary.cancelledBookings}</strong></div></div>
          </div>

          <div className="admin-two">
            <section className="panel">
              <h2>Revenue per day</h2>
              <Bars rows={r.daily} valueKey="revenue" format={formatINR} label="Daily revenue chart" />
              <p className="muted small">{formatDate(r.from)} to {formatDate(r.to)} &middot; based on successfully recorded payments, net of refunds.</p>
            </section>
            <section className="panel">
              <h2>Occupancy per day</h2>
              <Bars rows={r.daily} valueKey="occupancyPct" format={(v) => `${v}%`} label="Daily occupancy chart" />
              <p className="muted small">{r.totalRooms} active rooms &middot; confirmed and completed stays.</p>
            </section>
          </div>

          <div className="admin-two">
            <section className="panel">
              <h2>Bookings by status</h2>
              <table className="table table-compact">
                <thead><tr><th>Status</th><th>Bookings</th><th>Value</th></tr></thead>
                <tbody>{Object.entries(r.bookingsByStatus).map(([k, v]) => <tr key={k}><td><StatusBadge status={k} /></td><td>{v.n}</td><td>{formatINR(v.amount)}</td></tr>)}</tbody>
              </table>
            </section>
            <section className="panel">
              <h2>Top rooms by booking value</h2>
              {r.topRooms.length === 0 ? <p className="muted">No stays start within this range.</p> : (
                <table className="table table-compact">
                  <thead><tr><th>Room</th><th>Bookings</th><th>Value</th></tr></thead>
                  <tbody>{r.topRooms.map((t) => <tr key={t.id}><td>{t.name} <small>#{t.room_number}</small></td><td>{t.bookings}</td><td>{formatINR(t.revenue)}</td></tr>)}</tbody>
                </table>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
