"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  FileText,
  FilePlus2,
  Trash2,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function ContentPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const router = useRouter();

  const handleAddContent = () => router.push("/content-builder");

  // 🔹 Fetch dari backend
  useEffect(() => {
    const fetchContents = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/content");
        const data = await res.json();
        setContents(data);
      } catch (err) {
        console.error("Gagal memuat konten:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContents();
  }, []);

  const filteredContents = contents.filter(
    (item) =>
      (filter === "All" || item.status === filter) &&
      item.name.toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 DETAIL MODAL (Preview)
  const handleDetail = async (item: any) => {
    try {
      const res = await fetch(`http://localhost:4000/api/content/${item.slug}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      const { model, fields, content } = data;
      const fieldPreview = fields
        .map((f: any) => {
          const val = content[f.field_key] ?? "<i>Belum diisi</i>";
          return `
          <div style="margin-bottom:8px;">
            <b>${f.field_name}</b> <small style="color:#777">(${f.field_type})</small><br/>
            <span>${val}</span>
          </div>`;
        })
        .join("");

      Swal.fire({
        title: `${model.name} Preview`,
        html: `
        <div style="text-align:left; padding:10px">
          <h3 style="margin-bottom:10px;">Model Info</h3>
          <p><b>Slug:</b> ${model.slug}</p>
          <p><b>Type:</b> ${model.type}</p>
          <p><b>Endpoint:</b> ${model.api_endpoint}</p>
          <hr style="margin:10px 0"/>
          <h3 style="margin-bottom:10px;">Fields & Content</h3>
          ${fieldPreview || "<i>Tidak ada field</i>"}
        </div>
      `,
        width: 600,
        confirmButtonText: "Tutup",
        confirmButtonColor: "#3b82f6",
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal menampilkan detail.", "error");
    }
  };

  // 🔹 DELETE MODAL
  const handleDelete = async (item: any) => {
    const confirm = await Swal.fire({
      title: "Hapus Konten?",
      text: `Apakah kamu yakin ingin menghapus "${item.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/content-builder/model/${item.id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      Swal.fire("Deleted!", "Konten berhasil dihapus.", "success");
      setContents((prev) => prev.filter((c) => c.id !== item.id));
    } catch (err) {
      Swal.fire("Error", "Gagal menghapus konten.", "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64">
        <Topbar />

        <main className="flex-1 overflow-auto p-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  Content Management
                </h1>
                <p className="text-gray-500 mt-1">
                  Manage and organize your website content efficiently.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                {/* Search */}
                <div className="relative">
                  <Search
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-50 pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
                  />
                </div>

                {/* Filter */}
                <div className="relative">
                  <Filter
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={16}
                  />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-400 outline-none appearance-none"
                  >
                    <option>All</option>
                    <option>Published</option>
                    <option>Draft</option>
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* Add Content */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={handleAddContent}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2 flex items-center gap-2"
                >
                  <FilePlus2 size={18} />
                  Add Content
                </motion.button>
              </div>
            </div>

            {/* CONTENT GRID */}
            {loading ? (
              <p className="text-gray-500 text-center py-10">Loading...</p>
            ) : filteredContents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContents.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    onClick={() => router.push(`/content/${item.slug}`)} // Klik card → ke slug
                    className="group bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gray-50">
                          <FileText className="text-blue-500" size={26} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 leading-tight group-hover:text-blue-700 transition">
                          {item.name}
                        </h3>
                      </div>
                      <span className="text-xs font-medium bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                        {item.type}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                      API Endpoint: <code>{item.api_endpoint}</code>
                    </p>

                    {/* Tombol Aksi */}
                    <div className="flex items-center justify-end gap-4 mt-3 pt-3 border-t border-gray-100">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation(); // biar gak redirect
                          handleDetail(item);
                        }}
                        className="flex items-center gap-1.5 text-gray-600 text-sm font-medium hover:text-gray-800 transition"
                      >
                        <Eye size={16} />
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation(); // biar gak redirect
                          handleDelete(item);
                        }}
                        className="flex items-center gap-1.5 text-red-600 text-sm font-medium hover:text-red-700 transition"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-10">No content found</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
