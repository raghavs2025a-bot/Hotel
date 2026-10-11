import { useState } from 'react';
import { Eye, Power, Search } from 'lucide-react';
import Modal from '../../components/Modal.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { EmptyState, ErrorState, Loader } from '../../components/feedback.jsx';
import useFetch from '../../hooks/useFetch.js';
import useDebounce from '../../hooks/useDebounce.js';
import { useToast } from '../../context/ToastContext.jsx';
import { adminService } from '../../services/index.js';
import { errorMessage, formatDate, formatINR, formatINRPrecise } from '../../utils/format.js';

export default function AdminCustomers() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const dSearch = useDebounce(search);
  const { data, loading, error, reload } = useFetch(() => adminService.customers({ search: dSearch || undefined, status: status || undefined }), [dSearch, status]);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const open = async (c) => {
    setDetail({ customer: c, bookings: [] });
    setDetailLoading(true);
    try { setDetail(await adminService.customer(c.id)); } catch (err) { toast.error(errorMessage(err)); setDetail(null); } finally { setDetailLoading(false); }
  };

  const toggle = async (c) => {
    try {
      const res = await adminService.setCustomerActive(c.id, !c.is_active);
      toast.success(res.message);
      reload();
    } catch (err) { toast.error(errorMessage(err)); }
  };

  return (
    <>
      <div className="admin-head"><h1>Customers</h1><p className="muted">Manage customer accounts and review their booking history.</p></div>
      <div className="toolbar">
        <div className="search-input"><Search size={16} aria-hidden="true" /><input type="search" placeholder="Name, email or phone" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search customers" /></div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Account status"><option value="">All accounts</option><option value="active">Active</option><option value="inactive">Deactivated</option></select>
      </div>
      {loading && <Loader label="Loading customers..." />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && data.customers.length === 0 && <EmptyState title="No customers found" />}
      {data && data.customers.length > 0 && (
        <div className="panel table-wrap">
          <table className="table">
            <thead><tr><th>Customer</th><th>Phone</th><th>Joined</th><th>Bookings</th><th>Total spend</th><th>Account</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {data.customers.map((c) => (
                <tr key={c.id} className={c.is_active ? '' : 'row-muted'}>
                  <td data-label="Customer"><strong>{c.name}</strong><small>{c.email}</small></td>
                  <td data-label="Phone">{c.phone || '-'}</td>
                  <td data-label="Joined">{formatDate(c.created_at)}</td>
                  <td data-label="Bookings">{c.bookings_count}</td>
                  <td data-label="Spend">{formatINR(c.total_spent)}</td>
                  <td data-label="Account"><StatusBadge status={c.is_active ? 'active' : 'inactive'} /></td>
                  <td className="actions">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => open(c)}><Eye size={14} /> History</button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => toggle(c)}><Power size={14} /> {c.is_active ? 'Deactivate' : 'Activate'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {detail && (
        <Modal wide title={`${detail.customer.name} - booking history`} onClose={() => setDetail(null)}>
          <p className="muted">{detail.customer.email} &middot; {detail.customer.phone || 'no phone'}</p>
          {detailLoading && <Loader label="Loading history..." inline />}
          {!detailLoading && detail.bookings.length === 0 && <p>This customer has no bookings yet.</p>}
          {detail.bookings.length > 0 && (
            <div className="table-wrap">
              <table className="table table-compact">
                <thead><tr><th>Reference</th><th>Room</th><th>Stay</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>{detail.bookings.map((b) => (
                  <tr key={b.id}><td>{b.reference}</td><td>{b.room_name}</td><td>{formatDate(b.check_in)} &rarr; {formatDate(b.check_out)}</td><td>{formatINRPrecise(b.total_amount)}</td><td><StatusBadge status={b.status} /></td></tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
