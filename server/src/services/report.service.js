import { query } from '../config/db.js';
import { BOOKING_SELECT, syncStatuses } from '../models/booking.model.js';
import { AppError } from '../utils/AppError.js';
import { addDays, diffDays, isValidDateStr, todayStr } from '../utils/dates.js';
import { round2 } from './pricing.service.js';

const NET_REVENUE = "status IN ('success','partially_refunded')";

export async function dashboardStats() {
  const today = todayStr();
  await syncStatuses(today);
  const monthStart = `${today.slice(0, 7)}-01`;
  const [rooms, available, occupied, byStatus, revenue, monthRevenue, customers, arrivals, departures, recent] = await Promise.all([
    query("SELECT COUNT(*) AS total, COALESCE(SUM(operational_status = 'maintenance'), 0) AS maintenance FROM rooms WHERE is_active = 1"),
    query("SELECT COUNT(*) AS n FROM rooms r WHERE r.is_active = 1 AND r.operational_status = 'available' AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.room_id = r.id AND b.stay_status = 'checked_in')"),
    query("SELECT COUNT(DISTINCT b.room_id) AS n FROM bookings b JOIN rooms r ON r.id = b.room_id WHERE b.stay_status = 'checked_in' AND r.is_active = 1"),
    query('SELECT status, COUNT(*) AS n FROM bookings GROUP BY status'),
    query(`SELECT COALESCE(SUM(amount - refunded_amount), 0) AS v FROM payments WHERE ${NET_REVENUE}`),
    query(`SELECT COALESCE(SUM(amount - refunded_amount), 0) AS v FROM payments WHERE ${NET_REVENUE} AND paid_at >= ?`, [monthStart]),
    query("SELECT COUNT(*) AS n FROM users WHERE role = 'customer'"),
    query(`${BOOKING_SELECT} WHERE b.check_in = ? AND b.status IN ('pending','confirmed') AND b.stay_status = 'not_arrived' ORDER BY b.id`, [today]),
    query(`${BOOKING_SELECT} WHERE b.check_out = ? AND b.stay_status = 'checked_in' ORDER BY b.id`, [today]),
    query(`${BOOKING_SELECT} ORDER BY b.id DESC LIMIT 8`),
  ]);
  const statusCounts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  byStatus.forEach((r) => { statusCounts[r.status] = r.n; });
  return {
    rooms: { total: rooms[0].total, available: available[0].n, occupied: occupied[0].n, maintenance: rooms[0].maintenance },
    reservations: { total: Object.values(statusCounts).reduce((a, b) => a + b, 0), byStatus: statusCounts },
    revenue: { total: round2(revenue[0].v), thisMonth: round2(monthRevenue[0].v) },
    customers: customers[0].n,
    todayArrivals: arrivals,
    todayDepartures: departures,
    recentBookings: recent,
  };
}

export async function buildReport(from, to) {
  if (!isValidDateStr(from) || !isValidDateStr(to)) throw new AppError(400, 'Please provide valid from and to dates (YYYY-MM-DD).');
  if (to < from) throw new AppError(400, 'The end date must be on or after the start date.');
  const days = diffDays(from, to) + 1;
  if (days > 366) throw new AppError(400, 'Reports are limited to 366 days.');

  const [statusRows, revenueRows, stayRows, roomTotal, topRooms] = await Promise.all([
    query('SELECT status, COUNT(*) AS n, COALESCE(SUM(total_amount), 0) AS amount FROM bookings WHERE DATE(created_at) BETWEEN ? AND ? GROUP BY status', [from, to]),
    query(`SELECT DATE(paid_at) AS day, SUM(amount - refunded_amount) AS revenue, COUNT(*) AS payments FROM payments
           WHERE ${NET_REVENUE} AND paid_at IS NOT NULL AND DATE(paid_at) BETWEEN ? AND ? GROUP BY DATE(paid_at)`, [from, to]),
    query("SELECT check_in, check_out FROM bookings WHERE status IN ('confirmed','completed') AND check_in <= ? AND check_out > ?", [to, from]),
    query('SELECT COUNT(*) AS n FROM rooms WHERE is_active = 1'),
    query(`SELECT r.id, r.name, r.room_number, COUNT(b.id) AS bookings, COALESCE(SUM(b.total_amount), 0) AS revenue
           FROM bookings b JOIN rooms r ON r.id = b.room_id
           WHERE b.status IN ('confirmed','completed') AND b.check_in BETWEEN ? AND ?
           GROUP BY r.id ORDER BY revenue DESC LIMIT 5`, [from, to]),
  ]);

  const byStatus = { pending: { n: 0, amount: 0 }, confirmed: { n: 0, amount: 0 }, completed: { n: 0, amount: 0 }, cancelled: { n: 0, amount: 0 } };
  statusRows.forEach((r) => { byStatus[r.status] = { n: r.n, amount: round2(r.amount) }; });

  const revMap = new Map(revenueRows.map((r) => [r.day, r]));
  const totalRooms = roomTotal[0].n;
  const daily = [];
  let nightsSold = 0;
  for (let i = 0; i < days; i += 1) {
    const day = addDays(from, i);
    const occupied = stayRows.filter((s) => s.check_in <= day && s.check_out > day).length;
    nightsSold += occupied;
    const rev = revMap.get(day);
    daily.push({
      day,
      revenue: rev ? round2(rev.revenue) : 0,
      payments: rev ? rev.payments : 0,
      occupiedRooms: occupied,
      occupancyPct: totalRooms ? round2((occupied / totalRooms) * 100) : 0,
    });
  }
  const totalBookings = Object.values(byStatus).reduce((a, b) => a + b.n, 0);
  return {
    from, to, days, totalRooms,
    summary: {
      totalBookings,
      cancelledBookings: byStatus.cancelled.n,
      revenue: round2(daily.reduce((a, d) => a + d.revenue, 0)),
      nightsSold,
      averageOccupancyPct: totalRooms ? round2((nightsSold / (totalRooms * days)) * 100) : 0,
    },
    bookingsByStatus: byStatus,
    daily,
    topRooms: topRooms.map((r) => ({ ...r, revenue: round2(r.revenue) })),
  };
}
