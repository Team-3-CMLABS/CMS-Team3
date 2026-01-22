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
  const [role, setRole] = useState<string>("");

  const router = useRouter();

  const handleAddContent = () => router.push("/content-builder");

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

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setRole(user.role);

    fetchContents();
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

      const getField = (name: string) =>
        fields.find((f: any) => f.name === name);

      const titleField = getField("title");
      const datetimeField = getField("datetime");
      const locationField = getField("location");
      const bodyField = getField("body");
      const mediaFields = fields.filter((f: any) => f.type === "media");

      const title = titleField
        ? contentData[titleField.name]
        : "Untitled";

      const formattedDate = datetimeField
        ? new Date(contentData[datetimeField.name]).toLocaleString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
        : "";

      const location = locationField
        ? contentData[locationField.name]
        : null;

      let mediaHtml = "";

      if (mediaFields.length > 0) {
        const resolveMediaUrl = (url: string) => {
          if (!url) return "";
          if (url.startsWith("http")) return url;
          return `http://localhost:4000${url}`;
        };

        const extractUrl = (v: any): string[] => {
          if (!v) return [];

          // array
          if (Array.isArray(v)) {
            return v.flatMap(extractUrl);
          }

          // string
          if (typeof v === "string") {
            return [resolveMediaUrl(v)];
          }

          // direct object
          if (v.url) return [resolveMediaUrl(v.url)];
          if (v.path) return [resolveMediaUrl(v.path)];

          // nested file
          if (v.file?.url) return [resolveMediaUrl(v.file.url)];
          if (v.file?.path) return [resolveMediaUrl(v.file.path)];

          return [];
        };

        const allMediaUrls = mediaFields.flatMap((field: any) =>
          extractUrl(contentData[field.name])
        );

        const totalMedia = allMediaUrls.length;

        mediaHtml = `
<style>
  .media-slider {
    position: relative;
    max-width: 900px;
    margin: 0 auto 32px;
    border-radius: 14px;
    overflow: hidden;
    background: #f1f5f9;
  }

  .media-slide {
    display: none;
  }

  .media-slide.active {
    display: block;
  }

  .hero-image {
    width: 100%;
    height: auto;
    max-height: 420px;
    object-fit: contain;
    display: block;
    margin: auto;
  }

  .slider-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0,0,0,0.5);
    color: white;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 999px;
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .slider-btn.left { left: 12px; }
  .slider-btn.right { right: 12px; }

  .slider-counter {
    position: absolute;
    bottom: 10px;
    right: 12px;
    background: rgba(0,0,0,0.55);
    color: white;
    font-size: 12px;
    padding: 3px 8px;
    border-radius: 999px;
  }
</style>

<div class="media-slider">
  ${allMediaUrls
            .map(
              (url: any, i: number) => `
      <div class="media-slide ${i === 0 ? "active" : ""}">
        <img src="${url}" class="hero-image" />
      </div>
    `
            )
            .join("")}

  ${totalMedia > 1
            ? `
    <button class="slider-btn left" onclick="slideMedia(-1)">‹</button>
    <button class="slider-btn right" onclick="slideMedia(1)">›</button>
    <div class="slider-counter">
      <span id="mediaIndex">1</span> / ${totalMedia}
    </div>
  `
            : ""
          }
</div>
`;

      }

      const rawBody = bodyField ? contentData[bodyField.name] : "";

      const body = rawBody
        ? rawBody
          .split(/\n\s*\n/)
          .map((p: string) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
          .join("")
        : "";

      const statusLabel = status === "published" ? "PUBLISHED" : "DRAFT";
      const statusColor = status === "published" ? "#22c55e" : "#f97316";

      const getMapsUrl = (location: any) => {
        if (!location) return "";

        // pakai koordinat (paling akurat)
        if (location.lat && location.lng) {
          return `https://www.google.com/maps?q=${location.lat},${location.lng}`;
        }

        // pakai nama lokasi
        if (location.name) {
          return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            location.name
          )}`;
        }

        // kalau string langsung
        if (typeof location === "string") {
          return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            location
          )}`;
        }

        return "";
      };

      const locationName =
        typeof location === "string"
          ? location
          : location?.name || "";

      const mapsUrl = getMapsUrl(location);

      const locationHtml =
        locationName && mapsUrl
          ? `
      • <a 
          href="${mapsUrl}"
          target="_blank"
          rel="noopener noreferrer"
          style="
            color:#2563eb;
            text-decoration:none;
            font-weight:500;
            display:inline-flex;
            align-items:center;
            gap:4px;
          "
        >
         <span style="display:inline-flex;align-items:center">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    style="margin-right:4px"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
</span>
          ${locationName}
        </a>
      `
          : "";

      Swal.fire({
        width: 1100,
        padding: "0",
        showConfirmButton: false,
        showCloseButton: false,
        allowOutsideClick: true,
        allowEscapeKey: true,
        customClass: {
          popup: "cms-popup",
          htmlContainer: "cms-html",
        },
        html: `
        <style>
  .cms-popup {
    padding: 0 !important;
    border-radius: 14px !important;
    overflow: hidden !important;
  }

  .cms-html {
    margin: 0 !important;
    padding: 0 !important;
  }
</style>

<div style="font-family:system-ui;background:#f8fafc">

  <!-- TOPBAR -->
  <div style="
  background:#3b73b9;
  color:white;
  padding:20px 40px;
  display:flex;
  justify-content:space-between;
  align-items:center;
">

  <!-- KIRI -->
  <div style="display:flex;align-items:center;gap:10px">
    <img src="/logo.png" style="width:32px;height:32px"/>
    <strong>CMS Web Vokasi</strong>
  </div>

  <!-- KANAN -->
  <div style="display:flex;align-items:center;gap:12px">

  <!-- STATUS -->
  <span style="
    background:${statusColor};
    padding:6px 14px;
    border-radius:999px;
    font-size:11px;
    font-weight:700;
    letter-spacing:0.5px;
  ">
    ${statusLabel}
  </span>

  <!-- MODEL -->
  <span style="
    font-size:17px;
    font-weight:600;
    opacity:0.95;
  ">
    ${typeof model === "string" ? model : model?.name}
  </span>

</div>

</div>


  <!-- HEADER (DINAMIS) -->
  <div style="
    background:white;
    padding:28px 32px;
    text-align:center;
    border-bottom:1px solid #e5e7eb;
  ">
    <h1 style="font-size:28px;font-weight:700;color:#111827">
      ${title}
    </h1>

    <div style="font-size:14px;color:#6b7280;margin-top:6px">
  ${formattedDate}
  ${locationHtml}
</div>  
  </div>

  <!-- CONTENT -->
  <article style="
    background:white;
    padding:32px 48px;
    color:#374151;
  ">
    ${mediaHtml}
    <style>
  .richtext {
    max-width: 860px;
    margin: 0 auto;
    font-size: 16px;
    line-height: 1.9;
    text-align: justify;
  }

  .richtext p {
    margin-bottom: 1.2em;
    text-indent: 2em; 
  }

  .richtext p:first-of-type {
   text-indent: 0;
  }
  .richtext h1,
  .richtext h2,
  .richtext h3 {
    font-weight: 700;
    margin: 1.8em 0 0.8em;
    color: #111827;
  }

  .richtext ul,
  .richtext ol {
    padding-left: 1.4em;
    margin-bottom: 1.2em;
  }

  .richtext li {
    margin-bottom: 0.5em;
  }

  .richtext img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 20px auto;
    border-radius: 12px;
  }
</style>

 <div class="richtext">
  ${body
            ? body
            : `<p style="color:#9ca3af;text-align:center">Konten belum diisi</p>`
          }
</div>

  </article>

  <!-- FOOTER  -->
  <footer style="
  background:#3b73b9;
  color:white;
  padding:24px 32px;
  font-size:13px;
">

  <!-- BARIS ATAS -->
  <div style="
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:24px;
  ">

    <!-- KIRI -->
      <div style="display:flex;align-items:center;gap:10px">
    <img src="/logo.png" style="width:32px;height:32px"/>
    <strong>CMS Web Vokasi</strong>
  </div>

    <!-- KANAN -->
<div style="
  text-align:right;
  display:flex;
  flex-direction:column;
  gap:6px;
">

  <!-- ALAMAT -->
  <div style="display:flex;justify-content:flex-end;gap:6px;align-items:center">
    Jl. Seruni No.9, Lowokwaru, Malang
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  </div>

  <!-- EMAIL -->
  <div style="display:flex;justify-content:flex-end;gap:6px;align-items:center">
    team3cms@gmail.com
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 4h16v16H4z"/>
      <path d="m22 6-10 7L2 6"/>
    </svg>
  </div>

  <!-- PHONE -->
  <div style="display:flex;justify-content:flex-end;gap:6px;align-items:center">
    0812-3456-7890
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 16.92V21a2 2 0 0 1-2.18 2
        19.79 19.79 0 0 1-8.63-3.07
        19.5 19.5 0 0 1-6-6
        19.79 19.79 0 0 1-3.07-8.67
        A2 2 0 0 1 3 1h4.09
        a2 2 0 0 1 2 1.72
        c.12.81.31 1.6.57 2.36
        a2 2 0 0 1-.45 2.11L8.09 8.09
        a16 16 0 0 0 6 6
        l1.9-1.9
        a2 2 0 0 1 2.11-.45
        c.76.26 1.55.45 2.36.57
        a2 2 0 0 1 1.72 2z"/>
    </svg>
  </div>

</div>

  </div>

  <!-- BARIS BAWAH (COPYRIGHT) -->
  <div style="
    margin-top:16px;
    text-align:center;
    font-size:12px;
    opacity:0.9;
  ">
    © 2025 CMS Vokasi UB
  </div>

</footer>


</div>
`,
        didOpen: () => {
          let currentMedia = 0;
          const slides = document.querySelectorAll(".media-slide");
          const indexText = document.getElementById("mediaIndex");

          // ⬇️ BIKIN GLOBAL (INI KUNCINYA)
          (window as any).slideMedia = (direction: number) => {
            if (!slides.length) return;

            slides[currentMedia].classList.remove("active");
            currentMedia =
              (currentMedia + direction + slides.length) % slides.length;
            slides[currentMedia].classList.add("active");

            if (indexText) {
              indexText.textContent = String(currentMedia + 1);
            }
          };
        },
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
                    onClick={() => {
                      if (role !== "viewer") {
                        router.push(`/content/${item.slug}`);
                      }
                    }}
                    className={`group bg-white border border-gray-200 rounded-xl p-5 shadow-sm 
  transition-all duration-300
  ${role === "viewer" ? "cursor-default" : "cursor-pointer hover:shadow-md"}
`}
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

                      {role !== "viewer" && (
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
                      )}
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
