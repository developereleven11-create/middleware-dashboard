"use client";

import { useEffect, useState } from "react";

export default function DeliveryReportsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/insights?limit=100");
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Failed to load");
        // Filter only OTD + In-Transit
        const filtered = json.data.filter(
          (o: any) =>
            o.viniculum?.status?.includes("Out for Delivery") ||
            o.viniculum?.status?.includes("In Transit")
        );
        setOrders(filtered);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) =>
    o.order_number.toString().includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <span className="animate-pulse">Loading Delivery Reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
        🚚 Delivery Reports
      </h1>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search by Order Number..."
          className="w-full md:w-1/3 p-3 rounded-xl bg-gray-800/60 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm placeholder-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-2xl shadow-lg backdrop-blur bg-gray-900/50 border border-gray-800">
        <table className="min-w-full text-sm text-gray-300">
          <thead>
            <tr className="bg-gray-800/80 text-gray-200 text-left">
              <th className="p-4">Order #</th>
              <th className="p-4">Created At</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Transporter</th>
              <th className="p-4">AWB</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-800/40 transition duration-150"
              >
                <td className="p-4 font-semibold text-cyan-300">
                  #{order.order_number}
                </td>
                <td className="p-4">
                  {new Date(order.created_at).toLocaleString()}
                </td>
                <td className="p-4">₹{order.total_price}</td>
                <td className="p-4">
                  <Badge
                    text={order.viniculum?.status || "N/A"}
                    color={
                      order.viniculum?.status?.includes("Out for Delivery")
                        ? "yellow"
                        : "blue"
                    }
                  />
                </td>
                <td className="p-4">
                  {order.viniculum?.shipDetail?.[0]?.transporter || "-"}
                </td>
                <td className="p-4">
                  {order.viniculum?.shipDetail?.[0]?.tracking_number || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  const colors: any = {
    green: "bg-green-500/20 text-green-400 border-green-500/40",
    yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
    red: "bg-red-500/20 text-red-400 border-red-500/40",
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    gray: "bg-gray-500/20 text-gray-400 border-gray-500/40",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${
        colors[color] || colors.gray
      }`}
    >
      {text}
    </span>
  );
}
