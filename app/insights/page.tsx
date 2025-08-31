'use client';
import { useState } from 'react';
import useSWR from 'swr';
import KPI from '@/components/KPI';
import StatusBadge from '@/components/StatusBadge';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function InsightsPage() {
  const [pageInfo, setPageInfo] = useState<string | null>(null);
  const { data, error, isLoading } = useSWR(
    `/api/insights?limit=50${pageInfo ? `&page_info=${pageInfo}` : ''}`,
    fetcher
  );
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  if (isLoading) return <div>Loading...</div>;
  if (error || !data?.ok) return <div className="text-red-400">Failed to load insights.</div>;

  const orders = data.data ?? [];

  return (
    <div className="p-8">
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <KPI label="Orders on this page" value={orders.length} />
      </div>

      {/* Orders Table */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="p-3 text-left">Order #</th>
              <th className="p-3 text-left">Pincode</th>
              <th className="p-3 text-left">State</th>
              <th className="p-3 text-left">Shipment</th>
              <th className="p-3 text-left">TAT</th>
              <th className="p-3 text-left">Remittance</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id} className="border-t border-white/10 hover:bg-white/5">
                <td
                  className="p-3 text-blue-400 cursor-pointer hover:underline"
                  onClick={() => setSelectedOrder(o)}
                >
                  {o.order_number}
                </td>
                <td className="p-3">{o.shipping_address?.zip ?? '—'}</td>
                <td className="p-3">{o.shipping_address?.province_code ?? '—'}</td>
                <td className="p-3"><StatusBadge status={o.shipment?.status ?? 'Pending'} /></td>
                <td className="p-3"><StatusBadge status={'On Time'} /></td>
                <td className="p-3"><StatusBadge status={'Not Settled'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <button
          disabled={!data.prevPage}
          onClick={() => setPageInfo(data.prevPage)}
          className="px-4 py-2 bg-white/10 rounded-lg disabled:opacity-30"
        >
          ⬅ Previous
        </button>
        <button
          disabled={!data.nextPage}
          onClick={() => setPageInfo(data.nextPage)}
          className="px-4 py-2 bg-white/10 rounded-lg disabled:opacity-30"
        >
          Next ➡
        </button>
      </div>

    {/* Drawer */}
{selectedOrder && (
  <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
    <div className="w-full sm:w-[500px] bg-gray-900/70 backdrop-blur-xl border-l border-white/10 p-6 overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4">
        Order {selectedOrder.order_number}
      </h2>

      <div className="space-y-2 text-sm text-gray-300">
        <p>Date: {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
        <p>Status: {selectedOrder.shipment?.status ?? 'Pending'}</p>
        <p>AWB: {selectedOrder.shipment?.awb ?? '—'}</p>
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
          )) || <li className="text-gray-400">No product data</li>}
        </ul>
      </div>

      <div className="mt-6 space-y-1 text-sm">
        <p>Subtotal: ₹{selectedOrder.subtotal_price ?? '—'}</p>
        {selectedOrder.total_discounts > 0 && (
          <p>Discounts: -₹{selectedOrder.total_discounts}</p>
        )}
        <p className="font-semibold text-lg">
          Total: ₹{selectedOrder.total_price ?? '—'}
        </p>
      </div>

      <button
        onClick={() => setSelectedOrder(null)}
        className="mt-6 w-full bg-white/10 hover:bg-white/20 py-2 rounded-lg"
      >
        Close
      </button>
    </div>
  </div>
)}
