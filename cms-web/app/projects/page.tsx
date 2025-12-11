"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Trash2, Eye, Search, X, FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [selectedCollabs, setSelectedCollabs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:4000/api/projects", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await res.json();
      setProjects(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Gagal mengambil data project:", err);
      setProjects([]);
    }
  };

  // 🔹 Ambil semua collaborator
  const fetchCollaborators = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/collaborators");
      const result = await res.json();
      // Pastikan data selalu array
      setCollaborators(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Gagal mengambil data collaborator:", err);
      setCollaborators([]);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchCollaborators();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "in progress":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "to do":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const handleCreateProject = async () => {
    if (!projectName.trim())
      return Swal.fire("Error", "Nama project wajib diisi!", "error");

    setLoading(true);
    try {
      // 1️⃣ Buat project baru
      const res = await fetch("http://localhost:4000/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          status: "To Do",
        }),
      });
      const data = await res.json();

      if (!data.id) throw new Error("Gagal membuat project");

      // 2️⃣ Tambahkan collaborators ke project
      if (selectedCollabs.length > 0) {
        await fetch(`http://localhost:4000/api/projects/${data.id}/add-collaborator`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collaborator_ids: selectedCollabs }),
        });
      }

      setShowModal(false);
      setProjectName("");
      setSelectedCollabs([]);
      fetchProjects();

      Swal.fire("Sukses", "Project berhasil dibuat!", "success");
    } catch (err: any) {
      console.error("Gagal menambah project:", err);
      Swal.fire("Gagal", err.message || "Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectCollab = (id: string) => {
    setSelectedCollabs((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleDeleteProject = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus project ini?",
      text: "Data tidak bisa dikembalikan setelah dihapus!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:4000/api/projects/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await Swal.fire("Terhapus!", "Project berhasil dihapus.", "success");
        fetchProjects();
      } else {
        const err = await res.json();
        Swal.fire("Gagal", err.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Terjadi kesalahan saat menghapus project.", "error");
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64">
        <Topbar />

        <main className="p-6 flex-1 overflow-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            {/* Header dan Search */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Project</h1>
                <p className="text-gray-500 mt-1">
                  List of projects you are working on.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search project..."
                    value={search || ""}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-slate-300 text-sm pl-8 pr-3 py-1.5 rounded-md focus:ring-2 focus:ring-blue-400 outline-none w-52 md:w-64"
                  />
                </div>

                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2 flex items-center gap-2"
                >
                  <FilePlus2 size={16} />
                  <span>Create Project</span>
                </Button>
              </div>
            </div>

            {/* Tabel Projects */}
            <div className="overflow-x-auto">
              <table className="min-w-full border border-slate-200 rounded-lg text-sm text-center">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="py-2 px-3 border-b">No</th>
                    <th className="py-2 px-3 border-b">Project</th>
                    <th className="py-2 px-3 border-b">Status</th>
                    <th className="py-2 px-3 border-b">Last Update</th>
                    <th className="py-2 px-3 border-b">Collaborator</th>
                    <th className="py-2 px-3 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project, index) => (
                    <tr key={project.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 border-b">{index + 1}</td>
                      <td className="py-2 px-3 border-b font-medium text-slate-800">
                        {project.name || "-"}
                      </td>
                      <td className="py-2 px-3 border-b">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-md ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status || "-"}
                        </span>
                      </td>
                      <td className="py-2 px-3 border-b text-slate-600">
                        {project.last_update
                          ? new Date(project.last_update).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            timeZone: "Asia/Jakarta",
                          })
                          : "-"}
                      </td>
                      <td className="py-2 px-3 border-b">
                        {project.collaborators?.length > 0 ? (
                          <div className="flex justify-center gap-1">
                            {project.collaborators
                              .slice(0, 3)
                              .map((c: any, i: number) => (
                                <div
                                  key={i}
                                  className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold"
                                  title={c.name}
                                >
                                  {c.name.charAt(0)}
                                </div>
                              ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            No collaborators
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 border-b space-x-2">
                        <button
                          onClick={() =>
                            router.push(`/projects/detail-projects?id=${project.id}`)
                          }
                          className="p-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* === MODAL CREATE PROJECT === */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Create New Project
            </h2>

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Nama Project</label>
              <input
                type="text"
                value={projectName || ""}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Masukkan nama project"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">Pilih Collaborator</label>
              <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                {collaborators.map((collab) => (
                  <label
                    key={collab.id}
                    className="flex items-center space-x-2 text-sm mb-1"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCollabs.includes(collab.id.toString())}
                      onChange={() => toggleSelectCollab(collab.id.toString())}
                    />
                    <span>{collab.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCreateProject}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition"
            >
              {loading ? "Saving..." : "Create Project"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
