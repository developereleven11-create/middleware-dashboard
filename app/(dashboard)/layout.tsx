import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 bg-gray-950 min-h-screen text-white">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
