// components/StatCard.tsx
import React from "react";

type ColorName = "blue" | "teal" | "indigo" | "purple" | "green" | "orange";

interface StatCardProps {
  title: string;
  value: string | number;
  color?: ColorName;
}

const COLOR_MAP: Record<ColorName, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
  teal: { bg: "bg-teal-50", text: "text-teal-600" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600" },
  purple: { bg: "bg-purple-50", text: "text-purple-600" },
  green: { bg: "bg-green-50", text: "text-green-600" },
  orange: { bg: "bg-orange-50", text: "text-orange-600" },
};

export default function StatCard({ title, value, color = "blue" }: StatCardProps) {
  const style = COLOR_MAP[color];

  return (
    <div className="rounded-xl p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-medium text-slate-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="mt-1 text-xs text-slate-400">Overview</p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`${style.bg} w-3.5 h-3.5 rounded-md`} />
          <p className={`text-2xl font-bold ${style.text} leading-none`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
