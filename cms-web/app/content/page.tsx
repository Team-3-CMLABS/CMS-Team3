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
  const [canAddContent, setCanAddContent] = useState(false);

  const router = useRouter();

  const handleAddContent = () => router.push("/content-builder/single-page");

  // 🔹 Ambil semua data konten
  useEffect(() => {
    const fetchContents = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        const res = await fetch("http://localhost:4000/api/content", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (data.contents) {
          setContents(data.contents || []);
        }
      } catch (err) {
        console.error("Gagal mengambil data konten:", err);
        Swal.fire("Error", "Gagal terhubung ke server", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchContents();

    const fetchPermission = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://localhost:4000/api/me/content-permission",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setCanAddContent(data.canAddContent === true);
      } catch (err) {
        console.error("Gagal cek permission:", err);
        setCanAddContent(false);
      }
    };

    fetchPermission();
  }, []);

  const filteredContents = contents.filter((item) => {
    const modelName = item.model || "";
    return (
      (filter === "All" || item.status === filter) &&
      modelName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleDetail = async (item: any) => {
    try {
      const res = await fetch(`http://localhost:4000/api/content/${item.slug}`);
      const data = await res.json();

      if (!data?.content) {
        Swal.fire("Error", "Konten tidak ditemukan.", "error");
        return;
      }

      const { model, fields, content } = data;
      const contentData = content?.raw ?? {};
      const status = content?.status ?? "draft";

      const resolveMediaUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        return `http://localhost:4000${url}`;
      };

      const rendered = fields
        .map((field: any) => {
          const value = contentData[field.name];
          if (value === undefined || value === null || value === "") return "";

          // ===== TEXT =====
          if (field.type === "text") {
            return `
            <h1 style="
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 16px;
              color: #1e293b;
              line-height: 1.3;
            ">${value}</h1>
          `;
          }

          // ===== RICH TEXT =====
          if (field.type === "richtext") {
            return `
            <div style="
              font-size: 16px;
              line-height: 1.75;
              color: #475569;
              margin-bottom: 24px;
            ">${value}</div>
          `;
          }

          // ===== NUMBER =====
          if (field.type === "number") {
            return `
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 12px 16px;
              background: #f8fafc;
              border-left: 3px solid #3b82f6;
              border-radius: 6px;
              margin-bottom: 20px;
            ">
              <span style="
                font-size: 14px;
                font-weight: 600;
                color: #64748b;
              ">${field.label}:</span>
              <span style="
                font-size: 16px;
                font-weight: 700;
                color: #1e293b;
              ">${value}</span>
            </div>
          `;
          }

          // ===== DATETIME =====
          if (field.type === "datetime") {
            const date = new Date(value);
            const formatted = isNaN(date.getTime())
              ? value
              : date.toLocaleString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

            return `
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 12px 16px;
              background: #f1f5f9;
              border-radius: 6px;
              margin-bottom: 20px;
            ">
              <span style="
                font-size: 14px;
                font-weight: 600;
                color: #64748b;
              ">${field.label}:</span>
              <span style="
                font-size: 14px;
                color: #334155;
              ">${formatted}</span>
            </div>
          `;
          }

          // ===== LOCATION =====
          if (field.type === "location") {
            const name = value?.name || "Lihat Lokasi di Google Maps";
            const url = value?.url;
            const lat = value?.lat;
            const lng = value?.lng;

            if (!url) return "";

            return `
            <div style="
              margin-bottom: 32px;
              padding: 20px;
              background: #f8fafc;
              border-radius: 12px;
              border: 1px solid #e2e8f0;
            ">
              <div style="margin-bottom: 16px;">
                <a 
                  href="${url}" 
                  target="_blank"
                  style="
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    background: #3b82f6;
                    color: white;
                    font-weight: 600;
                    font-size: 14px;
                    text-decoration: none;
                    border-radius: 8px;
                    transition: background 0.2s;
                  "
                  onmouseover="this.style.background='#2563eb'"
                  onmouseout="this.style.background='#3b82f6'"
                >
                  📍 ${name}
                </a>
              </div>

              ${lat && lng
                ? `
                <iframe
                  src="https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed"
                  style="
                    width: 100%;
                    height: 320px;
                    border-radius: 8px;
                    border: 0;
                  "
                  loading="lazy"
                ></iframe>
              `
                : ""
              }
            </div>
          `;
          }

          // ===== MEDIA =====
          if (field.type === "media") {
            let urls: string[] = [];

            if (typeof value === "string") {
              urls = [resolveMediaUrl(value)];
            } else if (Array.isArray(value)) {
              urls = value.map((v) =>
                typeof v === "string"
                  ? resolveMediaUrl(v)
                  : resolveMediaUrl(v?.url || v?.path)
              );
            } else if (typeof value === "object") {
              urls = [resolveMediaUrl(value.url || value.path)];
            }

            return urls
              .map(
                (url) => `
                <div style="
                  margin-bottom: 24px;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                ">
                  <img 
                    src="${url}"
                    style="
                      width: 100%;
                      max-height: 500px;
                      object-fit: cover;
                      display: block;
                    "
                  />
                </div>
              `
              )
              .join("");
          }

          return "";
        })
        .join("");

      Swal.fire({
        title: "Preview Halaman",
        width: 900,
        padding: "0",
        showCloseButton: true,
        confirmButtonText: "Tutup",
        confirmButtonColor: "#3b82f6",
        customClass: {
          popup: "preview-modal",
          htmlContainer: "preview-content",
        },
        html: `
        <div style="
          max-height: 75vh;
          overflow-y: auto;
          background: #ffffff;
        ">
          <!-- Header dengan Status Badge -->
          <div style="
            position: sticky;
            top: 0;
            background: linear-gradient(to bottom, #ffffff 0%, #ffffff 90%, transparent 100%);
            padding: 24px 40px 16px;
            z-index: 10;
            border-bottom: 1px solid #e2e8f0;
          ">
            <span style="
              display: inline-block;
              padding: 6px 14px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.5px;
              background: ${status === "published" ? "#dcfce7" : "#fef3c7"};
              color: ${status === "published" ? "#166534" : "#92400e"};
              border: 1px solid ${status === "published" ? "#bbf7d0" : "#fde68a"};
            ">
              ${status.toUpperCase()}
            </span>
          </div>

          <!-- Content Area -->
          <article style="
            padding: 32px 40px 40px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            text-align: left;
          ">
            ${rendered || `
              <div style="
                padding: 40px;
                text-align: center;
                color: #94a3b8;
                font-style: italic;
              ">
                Konten belum diisi
              </div>
            `}
          </article>

          <!-- Footer -->
          <div style="
            padding: 20px 40px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            font-size: 13px;
            color: #64748b;
          ">
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z"/>
              </svg>
              <span>
                Preview dari model <strong style="color: #334155;">${model?.name}</strong> 
                <span style="color: #94a3b8;">(${model?.slug})</span>
              </span>
            </div>  
          </div>
        </div>
      `,
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal menampilkan preview halaman.", "error");
    }
  };

  // 🔹 Delete
  const handleDelete = async (item: any) => {
    const confirm = await Swal.fire({
      title: "Hapus Konten?",
      text: `Apakah kamu yakin ingin menghapus "${item.model}"?`,
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
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
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
                    className="pl-9 pr-9 py-2 border border-gray-300 rounded-md text-sm bg-white 
  focus:ring-2 focus:ring-blue-400 outline-none appearance-none"
                  >
                    <option value="All">All</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none"
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
                {canAddContent && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={handleAddContent}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2 flex items-center gap-2"
                  >
                    <FilePlus2 size={18} />
                    Add Content
                  </motion.button>
                )}
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
                    onClick={() => router.push(`/content/${item.slug}`)}
                    className="group bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    {/* HEADER: TITLE + STATUS */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gray-50">
                          <FileText className="text-blue-500" size={26} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 leading-tight group-hover:text-blue-700 transition">
                          {item.model || "Untitled"}
                        </h3>
                      </div>

                      {/* STATUS BADGE */}
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${item.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {item.status === "published" ? "Published" : "Draft"}
                      </span>
                    </div>

                    {/* API ENDPOINT + EDITOR INFO */}
                    <div className="text-sm text-gray-500 mb-5 leading-relaxed space-y-1">
                      <p>
                        <span className="font-medium text-gray-700">Email Editor:</span>{" "}
                        {item.editor_email ? (
                          <span>{item.editor_email}</span>
                        ) : (
                          <span className="italic text-gray-400">Belum Ada Editor</span>
                        )}
                      </p>
                      <p>
                        API Endpoint: <code>/api/content/{item.slug}</code>
                      </p>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center justify-end gap-4 mt-3 pt-3 border-t border-gray-100">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDetail(item);
                        }}
                        className="flex items-center gap-1.5 text-gray-600 text-sm font-medium hover:text-gray-800 transition"
                      >
                        <Eye size={16} />
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
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
