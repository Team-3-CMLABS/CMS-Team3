"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64">
        <Topbar />
        <main className="space-y-6 p-6 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
