"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";

export default function PaymentConfirmation({
  method,
  provider,
  subscriptionId,
  paymentMethodId,
  amount,
  onConfirm,
}: {
  method: string;
  provider: string;
  subscriptionId: number;
  paymentMethodId: number;
  amount: number;
  onConfirm: (paymentData?: any) => void;
}) {
  const [info, setInfo] = useState<any>(null);
  const [status, setStatus] = useState<"waiting" | "paid" | "expired">("waiting");
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 menit
  const [copied, setCopied] = useState(false);
  const displayAmount = amount ?? 0;

  // Ambil data dari backend
  useEffect(() => {
    const fetchInstruction = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/paymentMethods");
        const all = await res.json();
        const match = all.find(
          (m: any) =>
            m.category.toLowerCase() === method.toLowerCase() &&
            m.provider.toLowerCase() === provider.toLowerCase()
        );
        setInfo(match || null);
      } catch (err) {
        console.error("Gagal ambil instruksi", err);
      }
    };
    fetchInstruction();
  }, [method, provider]);

  // Countdown timer
  useEffect(() => {
    if (status !== "waiting") return;
    if (timeLeft <= 0) {
      setStatus("expired");
      return;
    }
    const timer = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, status]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscriptionId,
          paymentMethodId,
          amount: displayAmount,
          status: "Paid",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal membuat payment");

      setStatus("paid");
      onConfirm?.(data);
    } catch (err: any) {
      console.error("Error creating payment:", err);
      alert(err.message || "Gagal membuat payment");
      setStatus("waiting");
    }
  };

  if (!info)
    return (
      <div className="bg-white p-8 rounded-xl text-center shadow-lg">
        <p className="text-gray-500">Memuat instruksi pembayaran...</p>
      </div>
    );

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-auto">
      <Card className="border-none shadow-none">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-xl font-semibold text-center text-gray-800">
            Complete Your Payment
          </CardTitle>
          <p className="text-center text-gray-500 mt-1">
            {info.provider} {info.category}
          </p>
        </CardHeader>

        <CardContent className="pt-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Nomor untuk Virtual Account / E-Wallet */}
          {(info.category === "Virtual Account" || info.category === "E-Wallet") && info.number && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center">
              <p className="text-xs uppercase tracking-wide text-blue-600 font-medium mb-2">
                {info.category === "Virtual Account" ? "Virtual Account Number" : "Phone Number"}
              </p>
              <div className="flex justify-center items-center gap-2 mb-1">
                <span className="text-2xl font-mono tracking-wider text-gray-900">{info.number}</span>
                <button
                  onClick={() => handleCopy(info.number)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Copy size={16} />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              {copied && <p className="text-xs text-green-600 mt-1">Nomor berhasil disalin!</p>}
            </div>
          )}

          {/* QRIS */}
          {info.category === "QR Code" && (
            <div className="flex justify-center mt-4">
              <img
                src="/qris-placeholder.png"
                alt="QRIS Code"
                className="w-48 h-48 border rounded-lg shadow-sm"
              />
            </div>
          )}

          {/* Total Pembayaran */}
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-1">Total Pembayaran</p>
            <p className="text-3xl font-bold text-gray-900">Rp{displayAmount.toLocaleString()}</p>
            <p className="text-gray-400 text-xs mt-2">
              Bayar sebelum: {new Date(Date.now() + 10 * 60 * 1000).toLocaleString("id-ID")}
            </p>
          </div>

          {/* Instruksi Pembayaran */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
            <h3 className="font-semibold mb-3 text-gray-800 text-sm uppercase tracking-wide">
              Instruksi Pembayaran
            </h3>
            <ul className="list-decimal list-inside text-gray-700 space-y-1.5 text-sm leading-relaxed">
              {info.instructions.map((step: string, i: number) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>

          {/* Status */}
          <div className="text-center border-t pt-4">
            {status === "waiting" && (
              <>
                <p className="text-yellow-600 font-semibold mb-1">⏳ Waiting for Payment</p>
                <p className="text-sm text-gray-500">Complete payment before time runs out.</p>
                <p className="text-lg font-mono mt-1">{formatTime(timeLeft)}</p>
              </>
            )}
            {status === "paid" && <p className="text-green-600 font-semibold">✅ Payment Received!</p>}
            {status === "expired" && <p className="text-red-600 font-semibold">❌ Payment Expired</p>}
          </div>
        </CardContent>
      </Card>

      {status === "waiting" && (
        <div className="flex justify-end mt-4">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleConfirm}
          >
            View Status
          </Button>
        </div>
      )}
    </div>
  );
}
