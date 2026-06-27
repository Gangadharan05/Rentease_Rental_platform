export default function StatusBadge({ status }) {
  const label = (status || '').replace(/_/g, ' ');
  return <span className={`re-badge re-badge-${status}`}>{label}</span>;
}
