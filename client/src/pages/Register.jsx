import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { errorMessage, fieldErrors } from '../utils/format.js';

export default function Register() {
  const { user, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const from = useLocation().state?.from;
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from || '/my-bookings'} replace />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!/^\+?[0-9]{10,13}$/.test(form.phone.replace(/[\s-]/g, ''))) e.phone = 'Enter a valid phone number (10-13 digits).';
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) e.password = 'Use at least 8 characters with a letter and a number.';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match.';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setFormError('');
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const u = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      toast.success(`Account created. Welcome, ${u.name.split(' ')[0]}!`);
      navigate(from || '/my-bookings', { replace: true });
    } catch (err) {
      setErrors(fieldErrors(err));
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const field = (k, label, type = 'text', auto) => (
    <div className="field">
      <label htmlFor={`r-${k}`}>{label}</label>
      <input id={`r-${k}`} type={type} autoComplete={auto} value={form[k]} onChange={set(k)} aria-invalid={Boolean(errors[k])} />
      {errors[k] && <span className="field-error">{errors[k]}</span>}
    </div>
  );

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit} noValidate>
        <h1>Create your account</h1>
        <p className="muted">Book faster and manage your stays in one place.</p>
        {formError && <p className="alert alert-error" role="alert">{formError}</p>}
        {field('name', 'Full name', 'text', 'name')}
        {field('email', 'Email', 'email', 'email')}
        {field('phone', 'Phone number', 'tel', 'tel')}
        {field('password', 'Password', 'password', 'new-password')}
        {field('confirm', 'Confirm password', 'password', 'new-password')}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? <Loader2 className="spin" size={18} /> : <UserPlus size={18} />} Create account</button>
        <p className="auth-alt">Already registered? <Link to="/login" state={{ from }}>Log in</Link></p>
      </form>
    </div>
  );
}
