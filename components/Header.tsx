'use client';
import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Header() {
  const { data } = useSWR('/api/insights', fetcher, { refreshInterval: 60_000 });
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 backdrop-blur bg-[var(--bg)]/70">
      <div className="container-page py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-500 grid place-items-center font-bold">Σ</div>
          <div>
            <h1 className="text-xl font-semibold">Middleware Insights</h1>
            <p className="text-xs text-white/60">Shopify × Shipment Providers</p>
          </div>
        </div>
        <div className="text-sm text-white/70">
          Last sync (IST): <span className="font-medium">{data?.lastSyncIST ?? '—'}</span>
        </div>
      </div>
    </header>
  );
}
