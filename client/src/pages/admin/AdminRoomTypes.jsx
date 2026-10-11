import { useEffect, useState } from 'react';
import { Edit3, Loader2, Plus } from 'lucide-react';
import Modal from '../../components/Modal.jsx';
import { ErrorState, Loader } from '../../components/feedback.jsx';
import useFetch from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import { adminService } from '../../services/index.js';
import { errorMessage, fieldErrors } from '../../utils/format.js';

export default function AdminRoomTypes() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => adminService.roomTypes(), []);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', sortOrder: 0 });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    setForm(editing === 'new' ? { name: '', description: '', sortOrder: (data?.types.length || 0) + 1 } : { name: editing.name, description: editing.description || '', sortOrder: editing.sort_order });
    setErrors({});
  }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing === 'new') await adminService.createRoomType(form); else await adminService.updateRoomType(editing.id, form);
      toast.success('Room type saved.');
      setEditing(null);
      reload();
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err));
    } finally { setBusy(false); }
  };

  return (
    <>
      <div className="admin-head row-between">
        <div><h1>Room types</h1><p className="muted">Categories used for searching and filtering rooms.</p></div>
        <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={18} /> Add type</button>
      </div>
      {loading && <Loader label="Loading room types..." />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && (
        <div className="panel table-wrap">
          <table className="table">
            <thead><tr><th>Order</th><th>Name</th><th>Description</th><th>Rooms</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {data.types.map((t) => (
                <tr key={t.id}>
                  <td data-label="Order">{t.sort_order}</td><td data-label="Name"><strong>{t.name}</strong></td>
                  <td data-label="Description" className="cell-wide">{t.description}</td><td data-label="Rooms">{t.rooms_count}</td>
                  <td className="actions"><button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(t)}><Edit3 size={14} /> Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <Modal title={editing === 'new' ? 'Add room type' : 'Edit room type'} onClose={() => !busy && setEditing(null)}
          footer={<>
            <button type="button" className="btn btn-outline" onClick={() => setEditing(null)} disabled={busy}>Cancel</button>
            <button type="submit" form="type-form" className="btn btn-primary" disabled={busy}>{busy && <Loader2 className="spin" size={16} />} Save</button>
          </>}>
          <form id="type-form" onSubmit={save} noValidate>
            <div className="field"><label htmlFor="t-name">Name</label><input id="t-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />{errors.name && <span className="field-error">{errors.name}</span>}</div>
            <div className="field"><label htmlFor="t-desc">Description</label><textarea id="t-desc" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="field"><label htmlFor="t-order">Display order</label><input id="t-order" type="number" min="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></div>
          </form>
        </Modal>
      )}
    </>
  );
}
