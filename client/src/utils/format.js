const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const inrPrecise = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatINR = (n) => inr.format(Number(n) || 0);
export const formatINRPrecise = (n) => inrPrecise.format(Number(n) || 0);

const pad = (n) => String(n).padStart(2, '0');
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISO(new Date());
export const addDaysISO = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number);
  return toISO(new Date(y, m - 1, d + n));
};
export const nightsBetween = (a, b) => {
  if (!a || !b) return 0;
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
};

export function formatDate(iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!iso) return '-';
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', opts);
}
export const formatDateLong = (iso) => formatDate(iso, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
export const formatDateTime = (s) => (s ? new Date(String(s).replace(' ', 'T')).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-');

export const errorMessage = (err, fallback = 'Something went wrong. Please try again.') =>
  err?.response?.data?.message || (err?.code === 'ERR_NETWORK' ? 'Cannot reach the server. Please check that the API is running.' : fallback);
export const fieldErrors = (err) => err?.response?.data?.details || {};

export const STATUS_LABELS = {
  pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled',
  not_arrived: 'Not arrived', checked_in: 'Checked in', checked_out: 'Checked out',
  success: 'Paid', failed: 'Failed', refunded: 'Refunded', partially_refunded: 'Part refunded',
  available: 'Available', maintenance: 'Maintenance', occupied: 'Occupied', active: 'Active', inactive: 'Inactive',
};
export const PAYMENT_METHOD_LABELS = { simulated_card: 'Simulated card payment', pay_at_hotel: 'Pay at hotel' };

export const bookingBucket = (b) => {
  if (b.status === 'cancelled') return 'cancelled';
  if (b.status === 'completed') return 'completed';
  return 'upcoming';
};
