import { useState } from 'react';
import { KeyRound, Loader2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { authService } from '../services/index.js';
import { errorMessage, fieldErrors, formatDate } from '../utils/format.js';

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', address: user.address || '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwBusy, setPwBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Please enter your full name.';
    if (!/^\+?[0-9]{10,13}$/.test(form.phone.replace(/[\s-]/g, ''))) errs.phone = 'Enter a valid phone number (10-13 digits).';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const r = await authService.updateProfile(form);
      setUser(r.user);
      toast.success('Profile updated.');
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err));
    } finally { setBusy(false); }
  };

  const changePw = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pw.currentPassword) errs.currentPassword = 'Enter your current password.';
    if (pw.newPassword.length < 8 || !/[A-Za-z]/.test(pw.newPassword) || !/[0-9]/.test(pw.newPassword)) errs.newPassword = 'Use at least 8 characters with a letter and a number.';
    if (pw.confirm !== pw.newPassword) errs.confirm = 'Passwords do not match.';
    setPwErrors(errs);
    if (Object.keys(errs).length) return;
    setPwBusy(true);
    try {
      await authService.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password updated.');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwErrors(fieldErrors(err));
      toast.error(errorMessage(err));
    } finally { setPwBusy(false); }
  };

  return (
    <div className="container section-sm">
      <h1 className="page-title">My profile</h1>
      <div className="profile-grid">
        <form className="card form-card" onSubmit={save} noValidate>
          <h2 className="h3">Personal information</h2>
          <div className="field"><label htmlFor="p-email">Email</label><input id="p-email" value={user.email} disabled /><span className="muted small">Email cannot be changed. Member since {formatDate(user.created_at)}.</span></div>
          <div className="field"><label htmlFor="p-name">Full name</label><input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={Boolean(errors.name)} />{errors.name && <span className="field-error">{errors.name}</span>}</div>
          <div className="field"><label htmlFor="p-phone">Phone</label><input id="p-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} aria-invalid={Boolean(errors.phone)} />{errors.phone && <span className="field-error">{errors.phone}</span>}</div>
          <div className="field"><label htmlFor="p-addr">Address</label><input id="p-addr" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? <Loader2 className="spin" size={18} /> : <Save size={18} />} Save changes</button>
        </form>

        <form className="card form-card" onSubmit={changePw} noValidate>
          <h2 className="h3">Change password</h2>
          {[['currentPassword', 'Current password', 'current-password'], ['newPassword', 'New password', 'new-password'], ['confirm', 'Confirm new password', 'new-password']].map(([k, label, auto]) => (
            <div className="field" key={k}>
              <label htmlFor={`pw-${k}`}>{label}</label>
              <input id={`pw-${k}`} type="password" autoComplete={auto} value={pw[k]} onChange={(e) => setPw({ ...pw, [k]: e.target.value })} aria-invalid={Boolean(pwErrors[k])} />
              {pwErrors[k] && <span className="field-error">{pwErrors[k]}</span>}
            </div>
          ))}
          <button type="submit" className="btn btn-outline" disabled={pwBusy}>{pwBusy ? <Loader2 className="spin" size={18} /> : <KeyRound size={18} />} Update password</button>
        </form>
      </div>
    </div>
  );
}
