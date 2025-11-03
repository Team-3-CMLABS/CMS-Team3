"use client";

import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox({ label, ...props }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
      <input
        type="checkbox"
        className="w-4 h-4 accent-blue-600 cursor-pointer"
        {...props}
      />
      {label && <span>{label}</span>}
    </label>
  );
}
