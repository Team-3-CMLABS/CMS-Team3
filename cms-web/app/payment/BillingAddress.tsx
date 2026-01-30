"use client";
import { useEffect } from "react";

export default function BillingAddress({ billingData, setBillingData }: any) {
  // Ambil data profile user aktif
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((resp) => {
        const data = resp.profile || resp; // handle dua kemungkinan struktur
        setBillingData((prev: any) => ({
          ...prev,
          name: data.full_name || "",
          email: data.email || "",
          country: data.country || "Indonesia",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          zip: data.zip || "",
          company: data.company || "",
        }));
      })
      .catch((err) => console.error("❌ Gagal ambil data profile:", err));
  }, [setBillingData]);

  // Simpan perubahan billing langsung ke backend
  const handleSaveBilling = async (key: string, value: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const updatedData = { ...billingData, [key]: value };
    setBillingData(updatedData);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/billing`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: updatedData.name,
          email: updatedData.email,
          address: updatedData.address,
          city: updatedData.city,
          state: updatedData.state,
          zip: updatedData.zip,
          country: updatedData.country,
          company: updatedData.company,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("⚠️ Gagal update billing:", text);
      }
    } catch (err) {
      console.error("Gagal update billing:", err);
    }
  };

  return (
    <form className="grid grid-cols-2 gap-4">
      <input
        placeholder="Full Name *"
        value={billingData.name}
        onChange={(e) => handleSaveBilling("name", e.target.value)}
        className="col-span-2 border rounded-md px-3 py-2"
      />
      <input
        placeholder="Email Billing *"
        type="email"
        value={billingData.email}
        onChange={(e) => handleSaveBilling("email", e.target.value)}
        className="col-span-2 border rounded-md px-3 py-2"
      />
      <input
        placeholder="Country *"
        value={billingData.country}
        onChange={(e) => handleSaveBilling("country", e.target.value)}
        className="border rounded-md px-3 py-2"
      />
      <input
        placeholder="Zip Code *"
        value={billingData.zip}
        onChange={(e) => handleSaveBilling("zip", e.target.value)}
        className="border rounded-md px-3 py-2"
      />
      <input
        placeholder="City *"
        value={billingData.city}
        onChange={(e) => handleSaveBilling("city", e.target.value)}
        className="border rounded-md px-3 py-2"
      />
      <input
        placeholder="State / Province *"
        value={billingData.state}
        onChange={(e) => handleSaveBilling("state", e.target.value)}
        className="border rounded-md px-3 py-2"
      />
      <input
        placeholder="Address *"
        value={billingData.address}
        onChange={(e) => handleSaveBilling("address", e.target.value)}
        className="col-span-2 border rounded-md px-3 py-2"
      />
      <input
        placeholder="Company (Optional)"
        value={billingData.company}
        onChange={(e) => handleSaveBilling("company", e.target.value)}
        className="col-span-2 border rounded-md px-3 py-2"
      />
    </form>
  );
}
