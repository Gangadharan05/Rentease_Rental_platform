export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
      <div className="spinner-border" style={{ color: 'var(--re-primary)' }} role="status" />
      <p className="mt-3 text-secondary mb-0">{label}</p>
    </div>
  );
}
