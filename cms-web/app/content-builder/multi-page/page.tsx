"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiEdit3, FiLayers, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import PageModal from "@/components/Modal";

export default function MultiPageList() {
  const router = useRouter();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // 🔹 Ambil data Multi Page dari DB
  const fetchPages = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await fetch("http://localhost:4000/api/content-builder?type=multi", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        Swal.fire("Error", err.message || "Gagal memuat daftar multi page", "error");
        return;
      }

      const data = await res.json();
      const list = Array.isArray(data.contents) ? data.contents : [];

      // 🔹 Filter hanya type multi
      let filtered = list.filter((item: any) => item.type === "multi");

      // 🔹 Kalau user role = editor, hanya tampilkan yang dia buat
      if (user.role === "editor" && user.email) {
        filtered = filtered.filter(
          (page: any) =>
            page.editor_email === user.email // cek yang dia buat
        );
      }

      setPages(filtered);
    } catch (err) {
      console.error("Gagal memuat multi page:", err);
      Swal.fire("Error", "Gagal memuat daftar multi page", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleModalClose = () => {
    setModalOpen(false);
    setTimeout(() => fetchPages(), 500);
  };

  // 🔹 Delete model
  const handleDeleteModel = async (id: number, name: string) => {
    const confirm = await Swal.fire({
      title: `Hapus ${name}?`,
      text: "Model dan semua field terkait akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:4000/api/content-builder/model/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) return Swal.fire("Error", data.message || "Gagal menghapus model", "error");

      Swal.fire("Berhasil!", "Model telah dihapus.", "success");
      setPages((prev) => prev.filter((page) => page.id !== id));
    } catch (err) {
      console.error("deleteModel error:", err);
      Swal.fire("Error", "Gagal menghapus model", "error");
    }
  };

  return (
    <div className="p-8 relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Multi Page Home</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-md transition"
        >
          <FiPlus /> Create Multi Page
        </button>
      </div>

      {/* 🔹 Grid List */}
      {loading ? (
        <p className="text-slate-500 text-center py-8">Loading...</p>
      ) : pages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition relative group"
            >
              {/* 🔹 Header card: judul + icon edit & delete sejajar */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <FiLayers className="text-purple-500" />
                  <h3
                    onClick={() => router.push(`/content-builder/multi-page/${page.slug}`)}
                    className="font-semibold text-slate-800 hover:text-purple-600 cursor-pointer"
                  >
                    {page.model}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push(`/content-builder/multi-page/${page.slug}`)}
                    className="text-slate-400 hover:text-purple-500 transition"
                    title="Edit"
                  >
                    <FiEdit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteModel(page.id, page.model)}
                    className="text-slate-400 hover:text-red-500 transition"
                    title="Delete"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>

              {/* 🔹 Info body */}
              <div className="text-sm text-slate-600 space-y-1">
                <p>
                  <span className="font-medium text-slate-700">Slug:</span> {page.slug}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Type:</span> {page.type || "multi"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Email Editor:</span>{" "}
                  {page.editor_email ? (
                    <span>{page.editor_email}</span>
                  ) : (
                    <span className="italic text-slate-400">Belum Ada Editor</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500 py-10">
          Belum ada multi page. Buat yang baru dulu yuk!
        </p>
      )}

      {/* 🔹 Modal Create */}
      {modalOpen && (
        <PageModal
          title="Create Multi Page"
          type="multi"
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
