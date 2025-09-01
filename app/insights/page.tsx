"use client";

import { useEffect, useState } from "react";

export default function InsightsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/insights?page=1&limit=20");
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Failed to load");
        setOrders(json.data);
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
        <span className="text-lg animate-pulse">Loading dashboard...</span>
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
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
        📊 Insights Dashboard
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <KPI label="Total Orders" value={orders.length} />
        <KPI
          label="Pending"
          value={orders.filter((o) => o.financial_status === "pending").length}
        />
        <KPI
          label="Shipped"
          value={orders.filter((o) => o.viniculum?.status?.includes("Shipped"))
            .length}
        />
        <KPI
          label="RTO"
          value={orders.filter((o) => o.viniculum?.status?.includes("RTO"))
            .length}
        />
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search by Order Number..."
          className="w-full md:w-1/3 p-3 rounded-xl bg-gray-800/60 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm placeholder-gray-400"
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
              <th className="p-4">Financial</th>
              <th className="p-4">Fulfillment</th>
              <th className="p-4">Viniculum Status</th>
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
                <td className="p-4 font-semibold text-indigo-300">
                  #{order.order_number}
                </td>
                <td className="p-4">{new Date(order.created_at).toLocaleString()}</td>
                <td className="p-4">₹{order.total_price}</td>
                <td className="p-4">
                  <Badge
                    text={order.financial_status}
                    color={
                      order.financial_status === "paid"
                        ? "green"
                        : order.financial_status === "pending"
                        ? "yellow"
                        : "red"
                    }
                  />
                </td>
                <td className="p-4">
                  <Badge
                    text={order.fulfillment_status || "unfulfilled"}
                    color={
                      order.fulfillment_status === "fulfilled"
                        ? "green"
                        : "gray"
                    }
                  />
                </td>
                <td className="p-4">
                  <Badge
                    text={order.viniculum?.status || "N/A"}
                    color={
                      order.viniculum?.status?.includes("RTO")
                        ? "red"
                        : order.viniculum?.status?.includes("Shipped")
                        ? "blue"
                        : "gray"
                    }
                  />
                </td>
                <td className="p-4">{order.viniculum?.shipDetail?.[0]?.transporter || "-"}</td>
                <td className="p-4">{order.viniculum?.shipDetail?.[0]?.tracking_number || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* --- Components --- */

function KPI({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-6 rounded-2xl backdrop-blur bg-gray-900/60 border border-gray-800 shadow-md hover:shadow-lg transition duration-200">
      <div className="text-gray-400 text-sm">{label}</div>
      <div className="text-2xl font-bold text-indigo-300">{value}</div>
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
      className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[color] || colors.gray}`}
    >
      {text}
    </span>
  );
}
