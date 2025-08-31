'use client';
import { useState } from 'react';
import useSWR from 'swr';
import KPI from '@/components/KPI';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function InsightsPage() {
  const { data, error, isLoading } = useSWR('/api/insights', fetcher);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-400">Failed to load insights.</div>;
  if (!data) return null;

  const rows = [...data.rto, ...data.ofd, ...data.inTransit].map((o: any) => ({
    ...o,
    order: o.order_number,
    status: o.shipment?.status ?? 'Pending Shipment',
    awb: o.shipment?.awb ?? '—',
  }));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPI label="RTO" value={data.rto.length} />
        <KPI label="OFD" value={data.ofd.length} />
        <KPI label="In Transit" value={data.inTransit.length} />
      </div>

      {/* Table */}
      <DataTable
        rows={rows}
        columns={[
          {
            key: 'order',
            label: 'Order #',
            render: (row) => (
              <button
                onClick={() => setSelectedOrder(row)}
                className="text-blue-400 hover:underline"
              >
                {row.order}
              </button>
            ),
          },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'awb', label: 'AWB' },
        ]}
      />

      {/* Order Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
          <div className="w-full sm:w-[500px] h-full bg-gray-900/70 backdrop-blur-xl border-l border-white/10 p-6 overflow-y-auto animate-slideIn">
            <h2 className="text-2xl font-semibold mb-4">Order {selectedOrder.order}</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-300">Date: {selectedOrder.created_at}</p>
              <p className="text-sm text-gray-300">Status: {selectedOrder.status}</p>
              <p className="text-sm text-gray-300">AWB: {selectedOrder.awb}</p>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Products</h3>
              <ul className="space-y-2">
                {selectedOrder.line_items?.map((item: any, i: number) => (
                  <li
                    key={i}
                    className="flex justify-between text-sm bg-gray-800/40 rounded-lg px-3 py-2"
                  >
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price}</span>
                  </li>
                )) || <li className="text-gray-400 text-sm">No product data</li>}
              </ul>
            </div>

            <div className="mt-6 space-y-1 text-sm">
              <p>Subtotal: ₹{selectedOrder.subtotal_price ?? '—'}</p>
              {selectedOrder.total_discounts && (
                <p>Discounts: -₹{selectedOrder.total_discounts}</p>
              )}
              <p className="font-semibold text-lg">
                Total: ₹{selectedOrder.total_price ?? '—'}
              </p>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
