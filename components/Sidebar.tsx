"use client";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-gray-200 h-screen p-4 fixed left-0 top-0">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>
      <nav className="space-y-4">
        <Link href="/insights" className="block hover:text-white">Insights</Link>
        <Link href="/reports/delivery" className="block hover:text-white">Delivery Reports</Link>
        <Link href="/remittance" className="block hover:text-white">Remittance</Link>
      </nav>
    </aside>
  );
}
