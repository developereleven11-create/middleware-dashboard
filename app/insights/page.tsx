'use client';
import { useState } from 'react';
import useSWR from 'swr';
import KPI from '@/components/KPI';
import StatusBadge from '@/components/StatusBadge';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function InsightsPage() {
  const { data, error, isLoading } = useSWR('/api/insights', fetcher);
  const [search, setSearch] = useState('');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-400">Failed to load insights.</div>;
  if (!data) return null;

  const allOrders = [...data.rto, ...data.ofd, ...data.inTransit].map((o: any) => ({
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
                <tr key={i} className="border-t border-white/10 hover:bg-white/5 transition">
                  <td className="p-3 text-blue-400 cursor-pointer hover:underline">{o.order}</td>
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
      </main>
    </div>
  );
}
