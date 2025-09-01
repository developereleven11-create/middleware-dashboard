"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Truck, Wallet } from "lucide-react";

const navItems = [
  {
    href: "/insights",
    label: "Insights",
    icon: BarChart3,
  },
  {
    href: "/reports/delivery",
    label: "Delivery Reports",
    icon: Truck,
  },
  {
    href: "/remittance",
    label: "Remittance",
    icon: Wallet,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-gray-900 text-gray-100 w-64 min-h-screen border-r border-gray-800 backdrop-blur-md bg-opacity-80">
      <div className="p-6 font-bold text-xl">📊 Dashboard</div>
      <nav className="flex flex-col space-y-2 px-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              pathname.startsWith(href)
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
