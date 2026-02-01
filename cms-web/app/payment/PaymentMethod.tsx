"use client";
import React, { useEffect, useState } from "react";

interface PaymentMethodItem {
  id: number;
  category: string;
  provider: string;
}

interface PaymentMethodProps {
  selectedMethod: string | null;
  setSelectedMethod: (value: string | null) => void;
  selectedSubMethod: string | null;
  setSelectedSubMethod: (value: string | null) => void;
  setSelectedMethodId: (value: number | null) => void;
}

export default function PaymentMethod({
  selectedMethod,
  setSelectedMethod,
  selectedSubMethod,
  setSelectedSubMethod,
  setSelectedMethodId,
}: PaymentMethodProps) {
  const [paymentOptions, setPaymentOptions] = useState<PaymentMethodItem[]>([]);

  // Ambil daftar dari backend
  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/paymentMethods`);
        const data = await res.json();
        setPaymentOptions(data);
      } catch (err) {
        console.error("Gagal ambil metode pembayaran", err);
      }
    };
    fetchMethods();
  }, []);

  // Kelompokkan berdasarkan kategori
  const groupedOptions = paymentOptions.reduce<
    Record<string, PaymentMethodItem[]>
  >((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {Object.keys(groupedOptions).length === 0 ? (
        <p className="text-sm text-gray-500">Memuat metode pembayaran...</p>
      ) : (
        Object.keys(groupedOptions).map((method) => (
          <div key={method} className="bg-gray-50 border rounded-lg overflow-hidden">
            <button
              onClick={() =>
                setSelectedMethod(method === selectedMethod ? null : method)
              }
              className={`w-full flex justify-between items-center px-4 py-3 text-left transition ${selectedMethod === method ? "bg-blue-50 border-gray-400" : "hover:bg-blue-50"
                }`}
            >
              <span className="font-medium">{method}</span>
              <span>{selectedMethod === method ? "▲" : "▼"}</span>
            </button>

            {selectedMethod === method && groupedOptions[method].length > 0 && (
              <div className="bg-gray-50 px-4 py-3 space-y-2 border-t">
                {groupedOptions[method].map((sub) => (
                  <button
                    key={sub.id} // <-- pastikan unique id
                    onClick={() => {
                      setSelectedSubMethod(sub.provider);
                      setSelectedMethodId(sub.id);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md border transition ${selectedSubMethod === sub.provider
                      ? "bg-blue-100 border-gray-400"
                      : "hover:bg-blue-50 border-gray-300"
                      }`}
                  >
                    {sub.provider}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
