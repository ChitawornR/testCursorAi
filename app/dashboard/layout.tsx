import Sidebar from "../components/SideBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4 border-r">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
