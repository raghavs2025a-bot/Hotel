import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';

export function Loader({ label = 'Loading...', inline = false }) {
  return (
    <div className={inline ? 'loader loader-inline' : 'loader'} role="status" aria-live="polite">
      <Loader2 className="spin" size={inline ? 18 : 32} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, message, action, icon: Icon = Inbox }) {
  return (
    <div className="state-box">
      <Icon size={40} aria-hidden="true" />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-box state-error" role="alert">
      <AlertTriangle size={40} aria-hidden="true" />
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && <button type="button" className="btn btn-outline" onClick={onRetry}>Try again</button>}
    </div>
  );
}
