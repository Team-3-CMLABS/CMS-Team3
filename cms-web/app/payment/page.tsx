"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import BillingAddress from "./BillingAddress";
import PaymentMethod from "./PaymentMethod";
import OrderSummary from "./OrderSummary";
import PaymentConfirmation from "./PaymentConfirmation";

export default function PaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planName = searchParams.get("plan") || "Professional";
    const monthlyPrice = 100;

    const [months, setMonths] = useState(1);
    const [agree, setAgree] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [selectedSubMethod, setSelectedSubMethod] = useState<string | null>(null);
    const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
    const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
    const [amount, setAmount] = useState<number>(monthlyPrice);

    const [billingData, setBillingData] = useState({
        name: "",
        email: "",
        country: "",
        zip: "",
        city: "",
        state: "",
        address: "",
        company: "",
    });

    const total = monthlyPrice * months;

    // Ambil data user
    useEffect(() => {
        const userId = Number(localStorage.getItem("userId") || 1);
        const token = localStorage.getItem("token");
        if (!userId) return;

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (res) => (res.ok ? res.json() : Promise.reject(await res.text())))
            .then((data) => {
                setBillingData({
                    ...billingData,
                    name: data.full_name || "",
                    email: data.email || "",
                    address: data.address || "",
                    city: data.city || "",
                    state: data.state || "",
                    zip: data.zip || "",
                    country: data.country || "",
                    company: data.company || "",
                });
            })
            .catch((err) => console.error("❌ Error ambil data user:", err));
    }, []);

    // Simpan billing ke profile
    const saveBillingToProfile = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/billing`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                full_name: billingData.name,
                email: billingData.email,
                address: billingData.address,
                city: billingData.city,
                state: billingData.state,
                zip: billingData.zip,
                country: billingData.country,
                company: billingData.company,
            }),
        });

        if (!res.ok) throw new Error(await res.text());
        return res.json();
    };

    // Buat subscription baru 
    const handlePurchase = async () => {
        if (!agree) {
            Swal.fire({
                icon: "warning",
                title: "Terms & Conditions",
                text: "Please agree to the Terms and Conditions first!",
                confirmButtonColor: "#3A7AC3",
            });
            return;
        }

        if (!selectedMethod) {
            Swal.fire({
                icon: "info",
                title: "Select Payment Method",
                text: "Please select a payment method before proceeding.",
                confirmButtonColor: "#3A7AC3",
            });
            return;
        }

        if (!selectedMethodId) {
            Swal.fire({
                icon: "error",
                title: "Payment Error",
                text: "Payment method not selected properly! Please try again.",
                confirmButtonColor: "#3A7AC3",
            });
            return;
        }

        try {
            await saveBillingToProfile();

            const planId = planName === "Professional" ? 2 : 1;
            const startDate = new Date().toISOString().split("T")[0];
            const endDate = new Date(new Date().setMonth(new Date().getMonth() + months))
                .toISOString()
                .split("T")[0];

            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    planId,
                    startDate,
                    endDate,
                    autoRenew: true,
                    billingName: billingData.name,
                    billingEmail: billingData.email,
                    billingAddress: `${billingData.address}, ${billingData.city} ${billingData.state} ${billingData.zip} ${billingData.country}`,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            // Simpan ke state
            setSubscriptionId(data.subscriptionId);
            setAmount(total);
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Transaction Failed",
                text: "Something went wrong during purchase. Please try again later.",
                confirmButtonColor: "#3A7AC3",
            });
        }
    };

    return (
        <div className="relative min-h-screen py-10 px-4 md:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center flex-1">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                        Complete Your Checkout
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Complete your checkout to activate your{" "}
                        <span className="font-medium text-blue-600">{planName}</span> plan
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <section className="bg-gradient-to-br from-blue-200 to-sky-100 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800">Billing Address</h2>
                            <BillingAddress billingData={billingData} setBillingData={setBillingData} />
                        </section>

                        <section className="bg-gradient-to-br from-blue-200 to-sky-100 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800">Payment Method</h2>
                            <PaymentMethod
                                selectedMethod={selectedMethod}
                                setSelectedMethod={setSelectedMethod}
                                selectedSubMethod={selectedSubMethod}
                                setSelectedSubMethod={setSelectedSubMethod}
                                setSelectedMethodId={setSelectedMethodId}
                            />
                        </section>
                    </div>

                    <div className="bg-gradient-to-br from-blue-200 to-sky-100 rounded-2xl p-6 h-fit">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">Order Summary</h2>
                        <OrderSummary
                            planName={planName}
                            monthlyPrice={monthlyPrice}
                            months={months}
                            setMonths={setMonths}
                            total={total}
                        />

                        <label className="flex items-center gap-2 mt-4 text-xs">
                            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                            I agree to the Terms of Use and Privacy Policy
                        </label>

                        <Button
                            onClick={handlePurchase}
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
                        >
                            Purchase
                        </Button>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {subscriptionId && selectedMethodId && amount > 0 && !showSuccess && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

                    {/* Modal Container */}
                    <div className="relative z-10 w-full max-w-md">
                        <PaymentConfirmation
                            method={selectedMethod!}
                            provider={selectedSubMethod || ""}
                            subscriptionId={subscriptionId}
                            paymentMethodId={selectedMethodId}
                            amount={amount}
                            onConfirm={() => setShowSuccess(true)}
                        />
                    </div>
                </div>
            )}

            {/* ✅ Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-[90%] text-center">
                        <h2 className="text-2xl font-bold text-green-600 mb-2">
                            Payment Successful!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Terima kasih! Pembayaran kamu telah berhasil dikonfirmasi.
                        </p>
                        <Button
                            onClick={() => {
                                setShowSuccess(false);
                                router.push("/plan-billing"); // baru redirect
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-6"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
