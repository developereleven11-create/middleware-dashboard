import React from 'react';

export default function KPI({ label, value, hint, tone = 'info' }:{ label:string; value:string|number; hint?:string; tone?:'info'|'success'|'warning'|'danger'}) {
  const toneMap = {
    info: 'from-blue-500/30 to-blue-400/10',
    success: 'from-green-500/30 to-green-400/10',
    warning: 'from-yellow-500/30 to-yellow-400/10',
    danger: 'from-red-500/30 to-red-400/10',
  } as const;

  return (
    <div className="card p-5 relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${toneMap[tone]} opacity-20`}></div>
      <div className="relative">
        <div className="text-white/70 text-xs uppercase tracking-wider">{label}</div>
        <div className="text-3xl font-semibold mt-1">{value}</div>
        {hint && <div className="text-white/60 text-xs mt-2">{hint}</div>}
      </div>
    </div>
  );
}
