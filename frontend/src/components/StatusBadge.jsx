export default function StatusBadge({ status, variant }) {
  const className = `badge badge--${variant || status?.toLowerCase() || 'default'}`;
  return <span className={className}>{status}</span>;
}
