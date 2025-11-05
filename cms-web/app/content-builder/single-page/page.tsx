"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiEdit3, FiFileText, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import PageModal from "@/components/Modal";

export default function SinglePageList() {
  const router = useRouter();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // 🔹 Ambil data Single Page dari DB
  const fetchPages = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/content");
      const data = await res.json();
      const filtered = data.filter((item: any) => item.type === "single");
      setPages(filtered);
    } catch (err) {
      console.error("Gagal memuat single page:", err);
      Swal.fire("Error", "Gagal memuat daftar single page", "error");
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
        <h2 className="text-2xl font-bold text-slate-900">Single Page Home</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition"
        >
          <FiPlus /> Create Single Page
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
                  <FiFileText className="text-blue-500" />
                  <h3
                    onClick={() => router.push(`/content-builder/single-page/${page.slug}`)}
                    className="font-semibold text-slate-800 hover:text-blue-600 cursor-pointer"
                  >
                    {page.name}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push(`/content-builder/single-page/${page.slug}`)}
                    className="text-slate-400 hover:text-blue-500 transition"
                    title="Edit"
                  >
                    <FiEdit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteModel(page.id, page.name)}
                    className="text-slate-400 hover:text-red-500 transition"
                    title="Delete"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>

              {/* 🔹 Info body */}
              <p className="text-sm text-slate-500 mb-1">Slug: {page.slug}</p>
              <p className="text-xs text-slate-400">
                Type: {page.type || "single"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500 py-10">
          Belum ada single page. Buat yang baru dulu yuk!
        </p>
      )}

      {/* 🔹 Modal Create */}
      {modalOpen && (
        <PageModal
          title="Create Single Page"
          type="single"
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
