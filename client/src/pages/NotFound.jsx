import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '../components/feedback.jsx';

export default function NotFound() {
  return (
    <div className="container section">
      <EmptyState icon={Compass} title="Page not found" message="The page you are looking for does not exist or has moved." action={<Link to="/" className="btn btn-primary">Back to home</Link>} />
    </div>
  );
}
