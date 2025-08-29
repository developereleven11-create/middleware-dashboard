import React from 'react';

export default function StatusBadge({ status }:{ status:string }) {
  const s = status?.toLowerCase?.() ?? '';
  let cls = 'badge badge-muted';
  if (s.includes('rto')) cls = 'badge badge-danger';
  else if (s.includes('out')) cls = 'badge badge-warning';
  else if (s.includes('transit')) cls = 'badge badge-info';
  else if (s.includes('deliv')) cls = 'badge badge-success';
  return <span className={cls}>{status || '—'}</span>;
}
