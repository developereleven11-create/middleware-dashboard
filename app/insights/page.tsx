"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

export default function InsightsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch Orders (used on load + after sync)
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/insights?page=${page}&limit=${limit}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load");
      setOrders(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const handleRowClick = async (orderNo: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderNo}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSelectedOrder(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDrawer = () => setSelectedOrder(null);

  const filteredOrders = orders.filter((o) =>
    o.orderNumber.toString().includes(search)
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
    <div className="min-h-screen bg-gray-950 text-white p-8 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
          📊 Insights Dashboard
        </h1>
        <SyncButton onSync={fetchOrders} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <KPI label="Total Orders" value={orders.length} />
        <KPI
          label="Pending"
          value={orders.filter((o) => o.financialStatus === "pending").length}
        />
        <KPI
          label="Shipped"
          value={orders.filter((o) =>
            o.viniculumStatus?.includes("Shipped")
          ).length}
        />
        <KPI
          label="RTO"
          value={orders.filter((o) => o.viniculumStatus?.includes("RTO")).length}
        />
      </div>

      {/* Search + Pagination */}
      <div className="mb-6 flex justify-between items-center">
        <input
          type="text"
          placeholder="🔍 Search by Order Number..."
          className="w-full md:w-1/3 p-3 rounded-xl bg-gray-800/60 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm placeholder-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Pagination Controls */}
        <div className="space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-800/60 rounded disabled:opacity-40"
          >
            ◀ Prev
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 bg-gray-800/60 rounded"
          >
            Next ▶
          </button>
        </div>
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
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-800/40 transition duration-150 cursor-pointer"
                onClick={() => handleRowClick(order.orderNumber)}
              >
                <td className="p-4 font-semibold text-indigo-300">
                  #{order.orderNumber}
                </td>
                <td className="p-4">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="p-4">₹{order.totalPrice}</td>
                <td className="p-4">
                  <Badge
                    text={order.financialStatus || "N/A"}
                    color={
                      order.financialStatus === "paid"
                        ? "green"
                        : order.financialStatus === "pending"
                        ? "yellow"
                        : "red"
                    }
                  />
                </td>
                <td className="p-4">
                  <Badge
                    text={order.fulfillmentStatus || "unfulfilled"}
                    color={
                      order.fulfillmentStatus === "fulfilled"
                        ? "green"
                        : "gray"
                    }
                  />
                </td>
                <td className="p-4">
                  <Badge
                    text={order.viniculumStatus || "N/A"}
                    color={
                      order.viniculumStatus?.includes("RTO")
                        ? "red"
                        : order.viniculumStatus?.includes("Shipped")
                        ? "blue"
                        : "gray"
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full md:w-[500px] bg-gray-900 text-white p-6 overflow-y-auto shadow-xl animate-slideIn">
            <button
              onClick={closeDrawer}
              className="text-gray-400 hover:text-white mb-4 text-sm"
            >
              ✖ Close
            </button>

            {detailLoading ? (
              <p className="animate-pulse text-gray-400">Loading details...</p>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">
                  Order #{selectedOrder.orderNumber}
                </h2>

                {/* Raw Shopify JSON */}
                <section className="mb-6">
                  <h3 className="font-semibold text-indigo-300 mb-2">
                    Shopify Details
                  </h3>
                  <pre className="text-xs bg-gray-800 p-2 rounded">
                    {JSON.stringify(selectedOrder.rawData, null, 2)}
                  </pre>
                </section>

                {/* Viniculum */}
                <section>
                  <h3 className="font-semibold text-indigo-300 mb-2">
                    Viniculum Status
                  </h3>
                  <p>{selectedOrder.viniculumStatus || "N/A"}</p>
                </section>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* --- Components --- */

function SyncButton({ onSync }: { onSync: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSync = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/jobs/syncShopify");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Sync failed");
      setMessage(`✅ Synced ${json.count || 0} orders`);
      await onSync(); // refresh table
    } catch (err) {
      setMessage("❌ Error syncing orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSync}
        disabled={loading}
        className="flex items-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-sm font-medium"
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Syncing..." : "Sync Now"}
      </button>
      {message && <p className="text-xs text-gray-400">{message}</p>}
    </div>
  );
}

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
      className={`px-3 py-1 rounded-full text-xs font-medium border ${
        colors[color] || colors.gray
      }`}
    >
      {text}
    </span>
  );
}

