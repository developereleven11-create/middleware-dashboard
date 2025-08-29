'use client';
import useSWR from 'swr';
import KPI from '@/components/KPI';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function InsightsPage(){
  const { data, isLoading, error } = useSWR('/api/insights', fetcher, { refreshInterval: 60_000 });
  if (isLoading) return <div>Loading…</div>;
  if (error) return <div className="text-red-400">Failed to load insights.</div>;
  if (!data) return null;

  const kpiData = [
    { label: 'RTO', value: data.rto.length, tone: 'danger' as const },
    { label: 'Out for Delivery', value: data.ofd.length, tone: 'warning' as const },
    { label: 'In Transit', value: data.inTransit.length, tone: 'info' as const },
    { label: 'Out of TAT', value: data.outOfTAT.length, tone: 'danger' as const },
    { label: 'TAT Breach (RTO)', value: data.tatBreach.length, tone: 'danger' as const },
    { label: 'Freight Discrepancies', value: data.freightDiscrepancies.length, tone: 'warning' as const },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiData.map(k => <KPI key={k.label} {...k} />)}
      </div>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold">Shipment Status Overview</h3>
        <DataTable
          rows={[...data.rto, ...data.ofd, ...data.inTransit].map((r:any)=> ({
            order: r.order_number,
            pincode: r.shipping_address.pincode,
            status: r.shipment?.status ?? '—',
            provider: r.shipment?.provider_id ?? '—',
            awb: r.shipment?.awb ?? '—',
            created_at: data.lastSyncIST,
          }))}
          columns={[
            { key: 'order', label: 'Order #' },
            { key: 'pincode', label: 'Pincode' },
            { key: 'status', label: 'Status', render: (row)=> <StatusBadge status={row.status} /> },
            { key: 'provider', label: 'Provider' },
            { key: 'awb', label: 'AWB' },
            { key: 'created_at', label: 'Last Sync (IST)' },
          ]}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold">TAT Analytics</h3>
        <DataTable
          rows={data.outOfTAT.map((r:any)=> ({
            order: r.order_number,
            pincode: r.shipping_address.pincode,
            status: r.shipment?.status ?? '—',
            eta: r.etaIST ?? '—',
            placed: r.created_at,
          }))}
          columns={[
            { key: 'order', label: 'Order #' },
            { key: 'pincode', label: 'Pincode' },
            { key: 'status', label: 'Status' },
            { key: 'eta', label: 'Promised ETA (IST)' },
            { key: 'placed', label: 'Order Placed (ISO)' },
          ]}
        />
        <div className="text-white/60 text-sm -mt-2">TAT Breach = Out of TAT and RTO.</div>
        <DataTable
          rows={data.tatBreach.map((r:any)=> ({
            order: r.order_number,
            pincode: r.shipping_address.pincode,
            provider: r.shipment?.provider_id ?? '—',
            awb: r.shipment?.awb ?? '—',
            eta: r.etaIST ?? '—',
          }))}
          columns={[
            { key: 'order', label: 'Order #' },
            { key: 'pincode', label: 'Pincode' },
            { key: 'provider', label: 'Provider' },
            { key: 'awb', label: 'AWB' },
            { key: 'eta', label: 'Promised ETA (IST)' },
          ]}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold">Freight Charge Discrepancies</h3>
        <DataTable
          rows={data.freightDiscrepancies.map((r:any)=> ({
            order: r.order_number,
            provider: r.shipment?.provider_id ?? '—',
            awb: r.shipment?.awb ?? '—',
            expected: `₹${r.expectedCharge}`,
            billed: `₹${r.shipment?.charges.total ?? 0}`,
            delta: `₹${r.delta}`,
          }))}
          columns={[
            { key: 'order', label: 'Order #' },
            { key: 'provider', label: 'Provider' },
            { key: 'awb', label: 'AWB' },
            { key: 'expected', label: 'Expected' },
            { key: 'billed', label: 'Billed' },
            { key: 'delta', label: 'Delta' },
          ]}
        />
      </section>
    </div>
  );
}
