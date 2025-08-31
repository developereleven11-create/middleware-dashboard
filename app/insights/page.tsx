'use client';
import { useState } from 'react';
import useSWR from 'swr';
import KPI from '@/components/KPI';
import StatusBadge from '@/components/StatusBadge';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function InsightsPage() {
  const [pageInfo, setPageInfo] = useState<string | null>(null);
  const { data, error, isLoading } = useSWR(
    `/api/orders?limit=50${pageInfo ? `&page_info=${pageInfo}` : ''}`,
    fetcher
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-400">Failed to load orders.</div>;
  if (!data) return null;

  const orders = data.data ?? [];

  return (
    <div className="p-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <KPI label="Total Orders (this page)" value={orders.length} />
      </div>

      {/* Orders Table */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="p-3 text-left">Order #</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id} className="border-t border-white/10 hover:bg-white/5 transition">
                <td className="p-3 text-blue-400">{o.order_number}</td>
                <td className="p-3">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-3">₹{o.total_price}</td>
                <td className="p-3"><StatusBadge status={o.fulfillment_status ?? 'Unfulfilled'} /></td>
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
    </div>
  );
}
