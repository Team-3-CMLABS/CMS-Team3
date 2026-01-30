"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, Link as LinkIcon, Search } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

/* ===== Dummy Data ===== */
const trafficData = [
  { month: "Jan", total: 4000, organic: 2200 },
  { month: "Feb", total: 3000, organic: 1500 },
  { month: "Mar", total: 4700, organic: 3800 },
  { month: "Apr", total: 4500, organic: 4000 },
  { month: "May", total: 6000, organic: 4800 },
  { month: "Jun", total: 6700, organic: 5400 },
  { month: "Jul", total: 7800, organic: 6200 },
];

const topKeywords = [
  { keyword: "seo optimization", position: 3, change: "+2", volume: "12,000", difficulty: "Medium" },
  { keyword: "digital marketing", position: 8, change: "-1", volume: "45,000", difficulty: "High" },
  { keyword: "content strategy", position: 5, change: "+3", volume: "8,500", difficulty: "Low" },
  { keyword: "link building", position: 12, change: "+5", volume: "6,700", difficulty: "Medium" },
  { keyword: "local seo", position: 4, change: "+1", volume: "15,000", difficulty: "Low" },
];

/* ===== STAT CARD COMPONENT ===== */
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  color?: "blue" | "teal" | "indigo" | "purple" | "green" | "orange";
  icon: React.ReactNode;
}

const COLOR_MAP = {
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
  teal: { bg: "bg-teal-50", text: "text-teal-600" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600" },
  purple: { bg: "bg-purple-50", text: "text-purple-600" },
  green: { bg: "bg-green-50", text: "text-green-600" },
  orange: { bg: "bg-orange-50", text: "text-orange-600" },
};

function StatCard({
  title,
  value,
  change,
  color = "blue",
  icon,
}: StatCardProps) {
  const style = COLOR_MAP[color];

  return (
    <div className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between">
      <div>
        <p className="text-[13px] font-medium text-slate-500 uppercase tracking-wide">
          {title}
        </p>
        <h3 className={`text-3xl font-bold mt-1 ${style.text}`}>{value}</h3>
        <p className="text-sm mt-1 font-medium text-slate-400">
          {change} vs last month
        </p>
      </div>

      <div className={`p-3 rounded-xl ${style.bg}`}>
        <div className={`${style.text}`}>{icon}</div>
      </div>
    </div>
  );
}

/* ===== MAIN DASHBOARD PAGE ===== */
export default function SeoDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-col flex-1 ml-64">
        <Topbar />

        <main className="p-8 flex-1 overflow-auto">
          {/* ===== Statistik Cards ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard
              title="Total Traffic"
              value="87.4K"
              change="+12.5%"
              color="blue"
              icon={<TrendingUp className="w-6 h-6" />}
            />
            <StatCard
              title="Organic Users"
              value="45.2K"
              change="+8.2%"
              color="green"
              icon={<Users className="w-6 h-6" />}
            />
            <StatCard
              title="Backlinks"
              value="1,247"
              change="+15.3%"
              color="purple"
              icon={<LinkIcon className="w-6 h-6" />}
            />
            <StatCard
              title="Keywords Ranked"
              value="342"
              change="+5.7%"
              color="teal"
              icon={<Search className="w-6 h-6" />}
            />
          </div>

          {/* ===== Traffic Overview Chart ===== */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-10">
            <h2 className="text-lg font-semibold text-slate-800">
              Traffic Overview
            </h2>
            <p className="text-slate-500 text-sm mb-5">
              Monthly website traffic trends
            </p>

            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trafficData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  strokeWidth={2.5}
                  name="Total Traffic"
                />
                <Area
                  type="monotone"
                  dataKey="organic"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorOrganic)"
                  strokeWidth={2.5}
                  name="Organic Traffic"
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="flex items-center gap-6 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 bg-blue-500 rounded-full"></span>
                <span className="text-slate-600">Total Traffic</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 bg-green-500 rounded-full"></span>
                <span className="text-slate-600">Organic Traffic</span>
              </div>
            </div>
          </div>

          {/* ===== Top Keywords Table ===== */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="pb-4 border-b border-slate-200 mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Top Keywords
              </h2>
              <p className="text-slate-500 text-sm">Current ranking positions</p>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-slate-700">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-5 font-semibold text-slate-700 border border-slate-200">Keyword</th>
                    <th className="text-center py-3 px-5 font-semibold text-slate-700 border border-slate-200">Position</th>
                    <th className="text-center py-3 px-5 font-semibold text-slate-700 border border-slate-200">Change</th>
                    <th className="text-center py-3 px-5 font-semibold text-slate-700 border border-slate-200">Volume</th>
                    <th className="text-center py-3 px-5 font-semibold text-slate-700 border border-slate-200">Difficulty</th>
                  </tr>
                </thead>

                <tbody>
                  {topKeywords.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="py-3 px-5 font-medium text-slate-800 border border-slate-200">
                        {item.keyword}
                      </td>
                      <td className="text-center py-3 px-5 text-slate-700 border border-slate-200">
                        #{item.position}
                      </td>
                      <td
                        className={`text-center py-3 px-5 font-semibold border border-slate-200 ${item.change.includes("+")
                            ? "text-emerald-500"
                            : item.change.includes("-")
                              ? "text-rose-500"
                              : "text-slate-500"
                          }`}
                      >
                        {item.change}
                      </td>
                      <td className="text-center py-3 px-5 text-slate-700 border border-slate-200">
                        {item.volume}
                      </td>
                      <td className="text-center py-3 px-5 border border-slate-200">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold ${item.difficulty === "Low"
                              ? "bg-emerald-100 text-emerald-700"
                              : item.difficulty === "Medium"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                        >
                          {item.difficulty}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
