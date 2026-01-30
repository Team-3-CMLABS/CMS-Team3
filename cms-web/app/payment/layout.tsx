"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar kiri */}
            <Sidebar />

            {/* Konten kanan */}
            <div className="flex flex-col flex-1 ml-64">
                {/* Topbar */}
                <Topbar />

                {/* Isi halaman payment */}
                <main className="space-y-6 p-6 flex-1 overflow-auto">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
