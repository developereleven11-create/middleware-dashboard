'use client';
import useSWR from 'swr';
import KPI from '@/components/KPI';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function InsightsPage() {
  const { data, error, isLoading } = useSWR('/api/insights', fetcher);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-400">Failed to load insights.</div>;
  }

  // Defensive: handle unexpected API responses
  if (!data || !Array.isArray(data.rto) || !Array.isArray(data.ofd) || !Array.isArray(data.inTransit)) {
    return (
      <div className="text-red-400">
        Insights API did not return expected data.
        <pre className="mt-2 text-xs text-gray-400">{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPI label="RTO" value={data.rto.length} />
        <KPI label="OFD" value={data.ofd.length} />
        <KPI label="In Transit" value={data.inTransit.length} />
      </div>

      <DataTable
        rows={[...data.rto, ...data.ofd, ...data.inTransit].map((o: any) => ({
          order: o.order_number ?? '—',
          status: o.shipment?.status ?? o.status ?? '—',
          awb: o.shipment?.awb ?? o.awb ?? '—',
        }))}
        columns={[
          { key: 'order', label: 'Order #' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'awb', label: 'AWB' },
        ]}
      />
    </div>
  );
}
