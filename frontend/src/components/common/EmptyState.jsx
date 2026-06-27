export default function EmptyState({ icon = 'bi-inbox', title, message, action }) {
  return (
    <div className="re-empty-state">
      <i className={`bi ${icon}`} style={{ fontSize: '2.5rem', color: 'var(--re-border)' }} />
      <h5 className="mt-3">{title}</h5>
      <p className="mb-3">{message}</p>
      {action}
    </div>
  );
}
