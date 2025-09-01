"use client";

import { useEffect, useState } from "react";

export default function DeliveryReportsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/insights?limit=100");
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Failed to load");
        // ✅ filter Out for Delivery + In Transit
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

  const handleRowClick = async (orderNo: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderNo}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setSelectedOrder(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDrawer = () => setSelectedOrder(null);

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
    <div className="min-h-screen bg-gray-950 text-white p-8 relative">
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
                className="hover:bg-gray-800/40 transition duration-150 cursor-pointer"
                onClick={() => handleRowClick(order.order_number)}
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

      {/* Drawer */}
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

                {/* Shopify */}
                <section className="mb-6">
                  <h3 className="font-semibold text-cyan-300 mb-2">
                    Shopify Details
                  </h3>
                  <p>Amount: ₹{selectedOrder.shopify?.total_price}</p>
                  <p>Status: {selectedOrder.shopify?.financial_status}</p>
                  <p>Fulfillment: {selectedOrder.shopify?.fulfillment_status}</p>
                  <h4 className="mt-3 font-semibold">Products:</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-300">
                    {selectedOrder.shopify?.line_items?.map((li: any) => (
                      <li key={li.id}>
                        {li.title} (x{li.quantity}) — ₹{li.price}
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Viniculum */}
                <section>
                  <h3 className="font-semibold text-cyan-300 mb-2">
                    Viniculum Shipment
                  </h3>
                  {selectedOrder.viniculum ? (
                    <>
                      <p>Status: {selectedOrder.viniculum.status}</p>
                      <p>
                        Transporter:{" "}
                        {selectedOrder.viniculum?.shipDetail?.[0]?.transporter ||
                          "-"}
                      </p>
                      <p>
                        AWB:{" "}
                        {selectedOrder.viniculum?.shipDetail?.[0]
                          ?.tracking_number || "-"}
                      </p>
                    </>
                  ) : (
                    <p>No shipment data</p>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      )}
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
