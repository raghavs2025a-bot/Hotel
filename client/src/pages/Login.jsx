import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { errorMessage } from '../utils/format.js';

export default function Login() {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from || (user.role === 'admin' ? '/admin' : '/my-bookings')} replace />;

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.password) errs.password = 'Enter your password.';
    setErrors(errs);
    setFormError('');
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const u = await login(form);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
      navigate(from || (u.role === 'admin' ? '/admin' : '/my-bookings'), { replace: true });
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit} noValidate>
        <h1>Welcome back</h1>
        <p className="muted">Log in to manage your reservations.</p>
        {from && <p className="alert alert-info">Please log in to continue with your booking.</p>}
        {formError && <p className="alert alert-error" role="alert">{formError}</p>}
        <div className="field">
          <label htmlFor="l-email">Email</label>
          <input id="l-email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-invalid={Boolean(errors.email)} />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <div className="field">
          <label htmlFor="l-pass">Password</label>
          <input id="l-pass" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} aria-invalid={Boolean(errors.password)} />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? <Loader2 className="spin" size={18} /> : <LogIn size={18} />} Log in</button>
        <p className="auth-alt">New to StayEase? <Link to="/register" state={{ from }}>Create an account</Link></p>
      </form>
    </div>
  );
}
