"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-1 ml-64 bg-white dark:bg-gray-800">
        <Topbar />

        <main className="space-y-6 p-6 flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
