"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trash2, LockKeyhole, Eye, Pencil } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";

export default function Page() {
  const router = useRouter();
  const [role, setRole] = useState<string>("");

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setRole(user.role);
  }, []);

  const [tokens] = useState([
    {
      id: 1,
      name: "Full Access",
      desc: "A master API token with full access to all endpoints.",
      created: "March 08, 2025",
      lastUse: "June 11, 2025",
      expired: "April 08, 2025",
    },
    {
      id: 2,
      name: "Custom Token",
      desc: "Tokens that can only be CUD (Create, Update, Delete).",
      created: "July 11, 2025",
      lastUse: "July 11, 2025",
      expired: "July 18, 2025",
    },
  ]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-col flex-1 ml-64">
        <Topbar />

        <main className="p-6 flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow border border-gray-200 p-6"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  API Token List
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Manage and monitor your API tokens easily.
                </p>
              </div>

              {role !== "viewer" && (
                <Button
                  onClick={() => router.push("/settings/new")}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2 flex items-center gap-2"
                >
                  <LockKeyhole size={16} />
                  <span>New API Token</span>
                </Button>
              )}
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto border border-slate-200">
              <table className="min-w-full text-sm text-slate-700">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="py-3 px-5 text-left font-bold w-[15%]">
                      Name
                    </th>
                    <th className="py-3 px-5 text-left font-bold w-[30%]">
                      Description
                    </th>
                    <th className="py-3 px-5 text-left font-bold w-[13%]">
                      Created
                    </th>
                    <th className="py-3 px-5 text-left font-bold w-[13%]">
                      Last Use
                    </th>
                    <th className="py-3 px-5 text-left font-bold w-[13%]">
                      Expired
                    </th>
                    <th className="py-3 px-5 text-center font-bold w-[10%]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tokens.length > 0 ? (
                    tokens.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-5 font-medium text-slate-800">
                          {item.name}
                        </td>
                        <td className="py-3 px-5 text-slate-600">{item.desc}</td>
                        <td className="py-3 px-5 text-slate-600">
                          {item.created}
                        </td>
                        <td className="py-3 px-5 text-slate-600">
                          {item.lastUse}
                        </td>
                        <td className="py-3 px-5 text-slate-600">
                          {item.expired}
                        </td>
                        <td className="py-3 px-5 text-center">
                          <div className="flex justify-center items-center gap-2">
                            {/* Detail */}
                            <button
                              className="p-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition"
                              title="Detail"
                            >
                              <Eye size={16} />
                            </button>

                            {/* Edit & Delete */}
                            {role !== "viewer" && (
                              <>
                                <button
                                  className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition"
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </button>

                                <button
                                  className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-6 text-slate-500 italic"
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
