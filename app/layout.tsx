import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex bg-gray-950 text-white">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900/80 backdrop-blur-md border-r border-gray-800 min-h-screen p-6 space-y-4">
          <h1 className="text-xl font-bold mb-8 text-cyan-400">📊 Dashboard</h1>

          <nav className="space-y-2">
            <Link
              href="/insights"
              className="block px-3 py-2 rounded-lg hover:bg-gray-800/60"
            >
              🔍 Insights
            </Link>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                Reports
              </p>
              <Link
                href="/reports/delivery"
                className="block px-3 py-2 rounded-lg hover:bg-gray-800/60"
              >
                🚚 Delivery Reports
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </body>
    </html>
  );
}
