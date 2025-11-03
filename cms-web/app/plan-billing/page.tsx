"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { CreditCard, Smartphone, QrCode, Download } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import PlanBuildingModal from "@/components/PlanBuildingModal";

export default function PlanAndBillingPage() {
    const [autoRenew, setAutoRenew] = useState(true);
    const [subscription, setSubscription] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    type UsageItem = { name: string; value: number; limit: number };
    const [usageData, setUsageData] = useState<UsageItem[]>([
        { name: "API Calls", value: 0, limit: 1 },
        { name: "Storage", value: 0, limit: 1 },
        { name: "Projects", value: 0, limit: 1 },
    ]);

    const COLORS = ["#10B981", "#F59E0B", "#EF4444"];
    const total = usageData.reduce((sum, d) => sum + d.value, 0);
    const goodPercentage =
        usageData.length > 0
            ? Math.min(100, Math.round((usageData[0].value / (usageData[0].limit || 1)) * 100))
            : 0;

    const userId =
        typeof window !== "undefined" ? localStorage.getItem("userId") : null;

    // Fetch subscription & payments
    useEffect(() => {
        if (!userId) return;

        const fetchBillingData = async () => {
            try {
                const [subRes, payRes, usageRes] = await Promise.all([
                    fetch(`http://localhost:4000/api/subscriptions/user/${userId}`),
                    fetch(`http://localhost:4000/api/payments/user/${userId}`),
                    fetch(`http://localhost:4000/api/subscriptions/usage/${userId}`),
                ]);

                if (!subRes.ok) throw new Error("Failed to fetch subscription");
                if (!payRes.ok) throw new Error("Failed to fetch payments");
                if (!usageRes.ok) throw new Error("Failed to fetch usage");

                const subData = await subRes.json();
                const payData = await payRes.json();
                const usageDataRes = await usageRes.json();

                setSubscription(subData[0] || null);
                setPayments(payData || []);
                setUsageData(usageDataRes.usageData || []);
                setAutoRenew(subData[0]?.autoRenew === 1);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBillingData();
    }, [userId]);

    const router = useRouter();

    const handleCancelSubscription = async (userId: number) => {
        try {
            const res = await fetch(
                `http://localhost:4000/api/subscriptions/cancel/user/${userId}`,
                {
                    method: "POST",
                }
            );

            if (!res.ok) throw new Error("Failed to cancel subscription");

            router.push("/dashboard");
        } catch (err) {
            console.error(err);
            alert("Error cancelling subscription");
        }
    };

    if (loading)
        return (
            <div className="flex items-center justify-center h-screen text-gray-500">
                Loading billing data...
            </div>
        );

    return (
        <div className="flex min-h-screen bg-slate-100">
            <div className="fixed inset-y-0 left-0 w-64 z-30">
                <Sidebar />
            </div>
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                <div className="fixed top-0 left-64 right-0 z-20 bg-white shadow-sm">
                    <Topbar />
                </div>
                <main className="flex-1 overflow-y-auto p-6 md:p-10 mt-20">
                    <div className="max-w-[1200px] mx-auto space-y-6">
                        {/* HEADER */}
                        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">
                                    Plan and Billing
                                </h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    Manage your subscription, payment methods, and usage details
                                </p>
                            </div>
                        </header>

                        {/* PACKAGE INFO */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="bg-blue-600 text-white px-5 py-2.5 rounded-t-xl">
                                    <div className="text-sm tracking-widest font-semibold">
                                        INFORMATION PACKAGE
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col gap-6">
                                    <div className="flex flex-wrap items-start justify-between gap-6">
                                        <div className="flex-1 min-w-[240px]">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-semibold text-slate-800">
                                                    {subscription?.plan_name || "No Active Plan"}
                                                </h3>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    {subscription ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                            <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-md">
                                                Enable automatic renewal for your subscription at the end of each billing cycle using your saved payment method.
                                            </p>
                                            <label className="flex items-center gap-2 mt-4">
                                                <input
                                                    type="checkbox"
                                                    checked={autoRenew}
                                                    onChange={async () => {
                                                        const newValue = !autoRenew;
                                                        setAutoRenew(newValue);
                                                        if (subscription) {
                                                            try {
                                                                await fetch(
                                                                    `http://localhost:4000/api/subscriptions/${subscription.id}/auto-renew`,
                                                                    {
                                                                        method: "PUT",
                                                                        headers: { "Content-Type": "application/json" },
                                                                        body: JSON.stringify({ autoRenew: newValue }),
                                                                    }
                                                                );
                                                            } catch (err) {
                                                                console.error(err);
                                                            }
                                                        }
                                                    }}
                                                    className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-400"
                                                />
                                                <span className="text-sm text-slate-600 font-medium">Auto Renewal</span>
                                            </label>
                                        </div>
                                        <div className="text-right min-w-[160px]">
                                            <div className="text-xs text-slate-500 font-medium">
                                                Subscription end date
                                            </div>
                                            <div className="mt-1 inline-flex items-center justify-center bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                                                {subscription?.endDate
                                                    ? new Date(subscription.endDate).toLocaleDateString("en-GB")
                                                    : "-"}
                                            </div>
                                            <div className="mt-6 text-3xl font-extrabold text-slate-800 tracking-tight">
                                                ${subscription ? subscription.plan_price : "0"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap justify-start gap-3">
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition font-medium"
                                        >
                                            Pay Package
                                        </button>
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="bg-emerald-500 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-emerald-600 transition font-medium"
                                        >
                                            Upgrade Package
                                        </button>
                                        <button
                                            onClick={() => setShowCancelModal(true)}
                                            className="bg-red-500 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-red-600 transition font-medium"
                                        >
                                            Cancel Package
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* SYSTEM USAGE */}
                            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative">
                                <div className="bg-blue-600 text-white px-4 py-2 rounded-t-xl">
                                    <div className="text-sm tracking-widest">SYSTEM USAGE OVERVIEW</div>
                                </div>
                                <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="relative w-48 h-48">
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie
                                                    data={usageData.map((u) => ({
                                                        ...u,
                                                        displayValue: Math.min(u.value, u.limit || 1),
                                                    }))}
                                                    dataKey="displayValue"
                                                    nameKey="name"
                                                    innerRadius={70}
                                                    outerRadius={90}
                                                    paddingAngle={3}
                                                    stroke="none"
                                                >
                                                    {usageData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={COLORS[index % COLORS.length]}
                                                        />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-2xl font-bold text-emerald-600">
                                                {goodPercentage}%
                                            </span>
                                            <span className="text-sm text-gray-500">Good</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 gap-2">
                                        {usageData.map((u, i) => (
                                            <div
                                                key={i}
                                                className="flex justify-between items-center px-4 py-2 border rounded-md bg-slate-50"
                                            >
                                                <span className="font-medium text-slate-800">{u.name}</span>
                                                <span className="text-slate-500 text-sm">
                                                    {u.value} / {u.limit || "-"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* PAYMENT METHOD */}
                        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative">
                            <div className="bg-blue-600 text-white px-4 py-2 rounded-t-xl">
                                <div className="text-sm tracking-widest">PAYMENT INFORMATION</div>
                            </div>
                            <div className="p-6 space-y-4">
                                {payments.map((m, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between gap-4 border rounded-md p-3 bg-white"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">
                                                {(() => {
                                                    const cat = m.method_category?.toLowerCase();
                                                    const prov = m.method_provider?.toLowerCase();
                                                    if (cat === "virtual account") return <CreditCard />;
                                                    if (cat === "e-wallet") return <Smartphone />;
                                                    if (prov === "qris") return <QrCode />;
                                                    return <QrCode />;
                                                })()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-800">{m.method_category || "Unknown"}</div>
                                                <div className="text-xs text-slate-500">{m.method_provider || "-"}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* BILLING HISTORY */}
                        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative">
                            <div className="bg-blue-600 text-white px-4 py-2 rounded-t-xl">
                                <div className="text-sm tracking-widest">BILLING HISTORY</div>
                            </div>
                            <div className="p-6 overflow-x-auto">
                                <table
                                    className="min-w-full text-sm table-auto border-separate"
                                    style={{ borderSpacing: "0 8px" }}
                                >
                                    <thead>
                                        <tr className="bg-slate-100 text-left">
                                            <th className="p-3">Plan</th>
                                            <th className="p-3">Date Paid</th>
                                            <th className="p-3">Nominal</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Invoice</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.length > 0 ? (
                                            payments.map((p, i) => (
                                                <tr key={i} className="bg-white border-t">
                                                    <td className="p-3">{p.plan_name}</td>
                                                    <td className="p-3">
                                                        {new Date(p.createdAt).toLocaleDateString("en-GB")}
                                                    </td>
                                                    <td className="p-3">${p.amount}</td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`inline-block px-3 py-1 rounded-full text-xs ${p.status === "Paid"
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : "bg-slate-100 text-slate-500"
                                                                }`}
                                                        >
                                                            {p.status}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className="p-3 text-blue-600 cursor-pointer flex items-center gap-1"
                                                        onClick={() => setSelectedInvoice(p)}
                                                    >
                                                        <Download className="w-4 h-4" /> Download
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="text-center py-4 text-gray-500"
                                                >
                                                    Belum ada riwayat pembayaran.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    {/* MODALS */}
                    <PlanBuildingModal show={showModal} onClose={() => setShowModal(false)} />

                    {showCancelModal && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
                                <h2 className="text-lg font-semibold mb-4">Confirm Cancellation</h2>
                                <p className="text-sm text-slate-600 mb-6">
                                    Are you sure you want to cancel your "{subscription?.plan_name || "No Active Plan"}" subscription?
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700"
                                    >
                                        No
                                    </button>
                                    <button
                                        onClick={() => handleCancelSubscription(subscription.userId)}
                                        className="px-4 py-2 rounded-lg bg-red-500 text-white"
                                    >
                                        Yes, Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 🧾 INVOICE MODAL */}
                    {selectedInvoice && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 print:bg-white">
                            <div
                                id="invoice-content"
                                className="bg-white w-[480px] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 print:shadow-none"
                            >
                                {/* Header with Logo */}
                                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src="/logo.png"
                                            alt="Company Logo"
                                            className="w-8 h-8 rounded-md bg-white/20 p-1"
                                        />
                                        <h2 className="text-lg font-semibold tracking-wide">CMS Platform</h2>
                                    </div>
                                    <span className="text-sm font-medium opacity-90">
                                        #{selectedInvoice.paymentId}
                                    </span>
                                </div>

                                {/* Body */}
                                <div className="p-6 text-slate-700">
                                    {/* Invoice Info */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase mb-1">Invoice Date</p>
                                            <p className="text-sm font-medium">
                                                {new Date(selectedInvoice.createdAt).toLocaleDateString("en-GB")}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-400 uppercase mb-1">Status</p>
                                            <span
                                                className={`px-3 py-1 text-xs rounded-full font-medium ${selectedInvoice.status === "Paid"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                            >
                                                {selectedInvoice.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <hr className="border-slate-200 mb-6" />

                                    {/* Payment Details */}
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Plan</span>
                                            <span className="font-medium text-slate-800">
                                                {selectedInvoice.plan_name}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Amount</span>
                                            <span className="font-semibold text-blue-600">
                                                ${selectedInvoice.amount}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Payment Method</span>
                                            <span className="font-medium text-slate-800">
                                                {selectedInvoice.method_provider || "-"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Decorative Divider */}
                                    <div className="my-6 border-t border-dashed border-slate-300" />

                                    {/* Thank You Section */}
                                    <div className="text-center">
                                        <p className="font-medium text-slate-700">Thank you for your purchase! 💙</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Please keep this invoice for your records.
                                        </p>
                                    </div>
                                </div>

                                {/* Footer Buttons */}
                                <div className="flex justify-end gap-3 bg-slate-50 px-6 py-4 print:hidden border-t border-slate-200">
                                    <button
                                        className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                                        onClick={() => setSelectedInvoice(null)}
                                    >
                                        Close
                                    </button>
                                    <button
                                        className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                                        onClick={() => window.print()}
                                    >
                                        Print / Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
