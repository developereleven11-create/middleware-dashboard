"use client";

import { useState } from "react";

type RemittanceEntry = {
  provider: string;
  amount: number;
  payment_date: string;
};

type ReconciliationRecord = {
  order_no: string;
  shopify_total: number;
  remittances: RemittanceEntry[];
  status: "Pending" | "Matched" | "Partial" | "Discrepancy" | "Overpaid";
};

export default function RemittanceReport() {
  const [records, setRecords] = useState<ReconciliationRecord[]>([
    {
      order_no: "2025443001",
      shopify_total: 1000,
      remittances: [],
      status: "Pending",
    },
    {
      order_no: "2025443002",
      shopify_total: 1500,
      remittances: [
        { provider: "Razorpay", amount: 1500, payment_date: "2025-09-01" },
      ],
      status: "Matched",
    },
    {
      order_no: "2025443003",
      shopify_total: 1200,
      remittances: [
        { provider: "Delhivery", amount: 800, payment_date: "2025-09-02" },
      ],
      status: "Partial",
    },
    {
      order_no: "2025443004",
      shopify_total: 2000,
      remittances: [
        { provider: "Shiprocket", amount: 2500, payment_date: "2025-09-02" },
      ],
      status: "Overpaid",
    },
  ]);

  const [filter, setFilter] = useState("All");

  const filtered = records.filter(
    (r) => filter === "All" || r.status === filter
  );

  const getBadgeColor = (status: string) => {
    switch (status) {
      case "Matched":
        return "bg-green-600 text-white";
      case "Pending":
        return "bg-gray-600 text-white";
      case "Partial":
        return "bg-yellow-500 text-black";
      case "Discrepancy":
        return "bg-red-600 text-white";
      case "Overpaid":
        return "bg-purple-600 text-white";
      default:
        return "bg-gray-400";
    }
  };

  // Mock file upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    alert(`✅ Uploaded: ${file.name}\n(Parsing & reconciliation coming soon)`);

    // For demo: simulate marking one Pending order as Matched
    setRecords((prev) =>
      prev.map((r) =>
        r.status === "Pending"
          ? {
              ...r,
              remittances: [
                { provider: "Delhivery", amount: r.shopify_total, payment_date: "2025-09-05" },
              ],
              status: "Matched",
            }
          : r
      )
    );
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-6">💰 Remittance & Reconciliation</h1>

      {/* Upload Section */}
      <div className="mb-8 p-6 border-2 border-dashed border-cyan-500/50 rounded-xl bg-gray-900/40 backdrop-blur-md flex flex-col items-center justify-center">
        <p className="mb-3 text-gray-300">
          Drag & drop your Excel file here, or click to upload
        </p>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="cursor-pointer"
        />
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        {["All", "Pending", "Matched", "Partial", "Discrepancy", "Overpaid"].map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg ${
                filter === f ? "bg-cyan-600" : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              {f}
            </button>
          )
        )}
      </div>

      {/* Table */}
      <div className="bg-gray-900/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-800 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-800/80 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Order No</th>
              <th className="px-4 py-3 text-left">Shopify Total</th>
              <th className="px-4 py-3 text-left">Remitted Amounts</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.order_no}
                className="border-t border-gray-800 hover:bg-gray-800/40"
              >
                <td className="px-4 py-3 font-medium">{r.order_no}</td>
                <td className="px-4 py-3">₹{r.shopify_total}</td>
                <td className="px-4 py-3">
                  {r.remittances.length === 0 ? (
                    <span className="text-gray-400">No remittance</span>
                  ) : (
                    <ul className="space-y-1">
                      {r.remittances.map((rem, i) => (
                        <li key={i}>
                          <span className="text-cyan-400">{rem.provider}</span> – ₹
                          {rem.amount} on {rem.payment_date}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeColor(
                      r.status
                    )}`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
