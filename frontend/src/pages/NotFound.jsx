import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1 className="font-display" style={{ fontSize: '3.5rem', color: 'var(--re-primary)' }}>404</h1>
      <p className="text-secondary mb-4">We couldn't find the page you were looking for.</p>
      <Link to="/" className="btn btn-primary">Back to home</Link>
    </div>
  );
}
