"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiEdit3, FiGrid, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import PageModal from "@/components/Modal";

export default function MultiComponentList() {
  const router = useRouter();
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // 🔹 Ambil data component dari DB
  const fetchComponents = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/content");
      const data = await res.json();
      const filtered = data.filter((item: any) => item.type === "component");
      setComponents(filtered);
    } catch (err) {
      console.error("Gagal memuat component:", err);
      Swal.fire("Error", "Gagal memuat daftar component", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const handleModalClose = () => {
    setModalOpen(false);
    setTimeout(() => fetchComponents(), 500);
  };

  const handleDeleteComponent = async (id: number, name: string) => {
    const confirm = await Swal.fire({
      title: `Hapus ${name}?`,
      text: "Component dan semua field terkait akan dihapus permanen.",
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
      if (!res.ok)
        return Swal.fire("Error", data.message || "Gagal menghapus component", "error");

      Swal.fire("Berhasil!", "Component telah dihapus.", "success");
      setComponents((prev) => prev.filter((comp) => comp.id !== id));
    } catch (err) {
      console.error("deleteComponent error:", err);
      Swal.fire("Error", "Gagal menghapus component", "error");
    }
  };

  return (
    <div className="p-8 relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Components</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md transition"
        >
          <FiPlus /> Create Component
        </button>
      </div>

      {/* 🔹 Grid List */}
      {loading ? (
        <p className="text-slate-500 text-center py-8">Loading...</p>
      ) : components.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {components.map((comp, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition relative group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <FiGrid className="text-green-500" />
                  <h3
                    onClick={() => router.push(`/content-builder/component/${comp.slug}`)}
                    className="font-semibold text-slate-800 hover:text-green-600 cursor-pointer"
                  >
                    {comp.name}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push(`/content-builder/component/${comp.slug}`)}
                    className="text-slate-400 hover:text-green-500 transition"
                    title="Edit"
                  >
                    <FiEdit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteComponent(comp.id, comp.name)}
                    className="text-slate-400 hover:text-red-500 transition"
                    title="Delete"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-500 mb-1">Slug: {comp.slug}</p>
              <p className="text-xs text-slate-400">Type: {comp.type || "component"}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500 py-10">
          Belum ada component. Buat yang baru dulu yuk!
        </p>
      )}

      {/* 🔹 Modal Create */}
      {modalOpen && (
        <PageModal title="Create Component" type="component" onClose={handleModalClose} />
      )}
    </div>
  );
}
