import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}