"use client";
import React from "react";
import { FiMove, FiTrash2 } from "react-icons/fi";

export default function FieldCard({
  title = "Text Field",
  subtitle = "Short Text",
  color = "bg-violet-200 text-violet-800",
}: {
  title?: string;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div className="border rounded-lg p-3 bg-whitez shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-gray-50">
          <FiMove className="text-gray-400" />
        </div>

        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-md flex items-center justify-center ${color} font-semibold text-sm`}>
            T
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
      </div>

      <button className="text-red-500 hover:text-red-600">
        <FiTrash2 />
      </button>
    </div>
  );
}
