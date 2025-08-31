'use client';
import { useState } from 'react';
import useSWR from 'swr';
import KPI from '@/components/KPI';
import StatusBadge from '@/components/StatusBadge';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function InsightsPage() {
  const { data, error, isLoading } = useSWR('/api/insights', fetcher);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-400">Failed to load insights.</div>;
  if (!data) return null;

  const allOrders = [...data.rto, ...data.ofd, ...data.inTransit].map((o: any) => ({
    ...o,
    order: o.order_number,
    pincode: o.shipping_address?.zip ?? '452018',
    state: o.shipping_address?.province_code ?? 'MP',
    shipmentStatus: o.shipment?.status ?? 'Pending',
    tatStatus: 'On Time', // dummy
    remittanceStatus: 'Not Settled', // dummy
  }));

  const filtered = search
    ? allOrders.filter((o) => o.order.toString().includes(search))
    : allOrders;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col p-6">
        <div className="text-xl font-bold mb-8">📦 Dashboard</div>
        <nav className="flex flex-col gap-4 text-gray-300">
          <a className="hover:text-white cursor-pointer">Orders</a>
          <a className="hover:text-white cursor-pointer">Reports</a>
          <a className="hover:text-white cursor-pointer">Settings</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8">
        {/* Topbar */}
        <div className="flex items-center justify-between">
          <input
            type="text"
            placeholder="🔍 Search order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-4">
            <button className="p-2 rounded-full bg-white/10 hover:bg-white/20">🔔</button>
            <button className="p-2 rounded-full bg-white/10 hover:bg-white/20">⚙️</button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <KPI label="Total Orders" value={allOrders.length} />
          <KPI label="RTO" value={data.rto.length} />
          <KPI label="In Transit" value={data.inTransit.length} />
          <KPI label="OFD" value={data.ofd.length} />
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
              {filtered.map((o, i) => (
                <tr
                  key={i}
                  className="border-t border-white/10 hover:bg-white/5 transition"
                >
                  <td
                    className="p-3 text-blue-400 cursor-pointer hover:underline"
                    onClick={() => setSelectedOrder(o)}
                  >
                    {o.order}
                  </td>
                  <td className="p-3">{o.pincode}</td>
                  <td className="p-3">{o.state}</td>
                  <td className="p-3"><StatusBadge status={o.shipmentStatus} /></td>
                  <td className="p-3"><StatusBadge status={o.tatStatus} /></td>
                  <td className="p-3"><StatusBadge status={o.remittanceStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Drawer for Order Details */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
            <div className="w-full sm:w-[500px] h-full bg-gray-900/70 backdrop-blur-xl border-l border-white/10 p-6 overflow-y-auto animate-slideIn">
              <h2 className="text-2xl font-semibold mb-4">
                Order {selectedOrder.order}
              </h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-300">Date: {selectedOrder.created_at}</p>
                <p className="text-sm text-gray-300">Status: {selectedOrder.shipmentStatus}</p>
                <p className="text-sm text-gray-300">AWB: {selectedOrder.shipment?.awb ?? '—'}</p>
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
      </main>
    </div>
  );
}
