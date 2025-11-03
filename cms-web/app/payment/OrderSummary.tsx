"use client";
import React from "react";

export default function OrderSummary({ planName, monthlyPrice, months, setMonths, total }: any) {
  return (
    <div className="text-sm space-y-2 text-gray-700">
      <div className="flex justify-between">
        <span>{planName} Plan</span>
        <span>${monthlyPrice} / month</span>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span>Month:</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setMonths(Math.max(1, months - 1))} className="px-2 py-1 border rounded-md">-</button>
          <span className="font-semibold">{months}</span>
          <button onClick={() => setMonths(months + 1)} className="px-2 py-1 border rounded-md">+</button>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <span>Subtotal:</span>
        <span>${total}</span>
      </div>

      <div className="flex justify-between font-bold text-gray-900 mt-2">
        <span>Total:</span>
        <span>${total}</span>
      </div>
    </div>
  );
}
