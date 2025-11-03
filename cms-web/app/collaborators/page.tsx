"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Filter, Trash2, PencilIcon, Search } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function CollaboratorsPage() {
    const [collaborators, setCollaborators] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("All");
    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected] = useState<any>(null);

    const statuses = ["Active", "Pending", "Nonaktif"];
    const posisies = ["Owner", "Collaborator"];

    // ✅ Fetch Collaborators
    const fetchCollaborators = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:4000/api/collaborators");
            const result = await res.json();

            const arrayData = result.data;
            if (!Array.isArray(arrayData)) {
                console.error("Format data API tidak sesuai:", result);
                return;
            }

            const sortedData = arrayData.sort((a: any, b: any) => a.id - b.id);
            setCollaborators(sortedData);
        } catch (err) {
            console.error("Gagal memuat data:", err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch Projects untuk dropdown
    const fetchProjects = async () => {
        try {
            const res = await fetch("http://localhost:4000/api/collaborators/projects");
            const result = await res.json();
            setProjects(result.data || []);
        } catch (err) {
            console.error("Gagal memuat projects:", err);
        }
    };

    useEffect(() => {
        fetchCollaborators();
        fetchProjects();
    }, []);

    const handleDelete = async (id: number) => {
        const confirm = await Swal.fire({
            title: "Hapus Collaborator?",
            text: "Data ini akan dihapus permanen.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#dc2626",
        });
        if (confirm.isConfirmed) {
            await fetch(`http://localhost:4000/api/collaborators/${id}`, { method: "DELETE" });
            Swal.fire("Terhapus!", "Collaborator telah dihapus.", "success");
            fetchCollaborators();
        }
    };

    const handleEdit = (collab: any) => {
        setSelected({
            ...collab,
            projects: collab.projects?.map((p: any) => p.id) || [],
        });
        setShowModal(true);
    };

    const handleSaveEdit = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/collaborators/${selected.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    posisi: selected.posisi,
                    status: selected.status,
                    project_ids: selected.projects || [],
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                Swal.fire("Error", result.message || "Gagal memperbarui data", "error");
                return;
            }

            Swal.fire("Berhasil", "Data collaborator diperbarui", "success");
            await fetchCollaborators();
            setShowModal(false);
        } catch (err) {
            Swal.fire("Error", "Gagal memperbarui data", "error");
        }
    };

    const filteredCollaborators = collaborators.filter((c) => {
        const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter =
            filterType === "All" || c.status === filterType || c.posisi === filterType;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-col flex-1 ml-64">
                <Topbar />

                <main className="p-6 flex-1 overflow-auto">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-3">
                            {/* === Kiri: Judul === */}
                            <div className="flex flex-col justify-center">
                                <h1 className="text-2xl font-semibold text-slate-800 leading-tight">
                                    Collaborator Management
                                </h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    Manage all collaborators, their access, and current status
                                </p>
                            </div>

                            {/* === Kanan: Search, Filter === */}
                            <div className="flex items-center gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 text-slate-400 w-4 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search collaborator..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full sm:w-50 pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
                                    />
                                </div>

                                {/* Filter */}
                                <div className="relative">
                                    <Filter className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-400 outline-none appearance-none"
                                    >
                                        <option value="All">All</option>
                                        <optgroup label="Status">
                                            {statuses.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Posisi">
                                            {posisies.map((r) => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Info Banner */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-800">
                                💡 <strong>Info:</strong> Users with the <span className="font-semibold">editor</span> role are automatically added to the collaborator table.
                                You can manage project assignments here.
                            </p>
                        </div>

                        {loading ? (
                            <p className="text-center text-slate-500 italic py-4">Loading...</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm border border-slate-200 rounded-lg">
                                    <thead className="bg-slate-100 text-slate-700">
                                        <tr className="text-left">
                                            <th className="py-3 px-4 text-center w-[25%]">Collaborator</th>
                                            <th className="py-3 px-4 text-center w-[20%]">Project</th>
                                            <th className="py-3 px-4 text-center w-[15%]">Position</th>
                                            <th className="py-3 px-4 text-center w-[15%]">Status</th>
                                            <th className="py-3 px-4 text-center w-[15%]">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCollaborators.map((c) => (
                                            <tr
                                                key={c.id}
                                                className="border-t border-slate-200 hover:bg-blue-50 transition-all"
                                            >
                                                {/* Nama + badge + email */}
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-slate-800">{c.name}</span>
                                                            <span
                                                                className={`text-xs font-semibold px-2 py-1 rounded-full ${c.posisi === "Owner"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : c.posisi === "Collaborator"
                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                        : "bg-gray-100 text-gray-800"
                                                                    }`}
                                                            >
                                                                {c.posisi}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500">{c.email}</p>
                                                    </div>
                                                </td>

                                                {/* Project */}
                                                <td className="py-3 px-4 text-center">
                                                    {c.projects && c.projects.length > 0 ? (
                                                        <div className="flex flex-wrap justify-center gap-1">
                                                            {c.projects.map((p: any) => (
                                                                <span
                                                                    key={p.id}
                                                                    className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium"
                                                                >
                                                                    {p.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Not Assigned</span>
                                                    )}
                                                </td>

                                                {/* Posisi */}
                                                <td className="py-3 px-4 text-center">{c.posisi}</td>

                                                {/* Status */}
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.status === "Active"
                                                        ? "bg-green-100 text-green-800"
                                                        : c.status === "Pending"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-gray-100 text-gray-800"
                                                        }`}>
                                                        {c.status}
                                                    </span>
                                                </td>

                                                {/* Action */}
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        {/* Edit button */}
                                                        <button
                                                            onClick={() => handleEdit(c)}
                                                            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition"
                                                            title="Edit Collaborator"
                                                        >
                                                            <PencilIcon size={16} />
                                                        </button>
                                                        {/* Delete button */}
                                                        <button
                                                            onClick={() => handleDelete(c.id)}
                                                            className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
                                                            title="Hapus Collaborator"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Modal Edit */}
                    {showModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                            <div className="bg-white w-[90%] max-w-md md:max-w-lg lg:max-w-xl rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">
                                <h2 className="text-lg font-semibold mb-4 text-slate-800">
                                    Edit Collaborator
                                </h2>

                                {/* Info User */}
                                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                    <p className="text-sm text-gray-600">Editing: <strong>{selected?.name}</strong></p>
                                    <p className="text-xs text-gray-500">{selected?.email}</p>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-1 block">Posisi</label>
                                        <select
                                            value={selected?.posisi || ""}
                                            onChange={(e) =>
                                                setSelected({ ...selected, posisi: e.target.value })
                                            }
                                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                                        >
                                            {posisies.map((r) => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-1 block">Status</label>
                                        <select
                                            value={selected?.status || ""}
                                            onChange={(e) =>
                                                setSelected({ ...selected, status: e.target.value })
                                            }
                                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                                        >
                                            {statuses.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                                            Assign Projects
                                        </label>

                                        <div className="border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                                            {projects.length > 0 ? (
                                                projects.map((proj) => (
                                                    <label
                                                        key={proj.id}
                                                        className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-md cursor-pointer transition"
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    selected?.projects?.some(
                                                                        (p: any) => p.id === proj.id || p === proj.id
                                                                    ) || false
                                                                }
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    const current = selected?.projects || [];
                                                                    const updated = checked
                                                                        ? [...current, proj.id]
                                                                        : current.filter((id: any) => id !== proj.id);
                                                                    setSelected({ ...selected, projects: updated });
                                                                }}
                                                                className="w-4 h-4 accent-blue-500 cursor-pointer"
                                                            />
                                                            <span className="text-sm text-slate-700">{proj.name}</span>
                                                        </div>

                                                        {selected?.projects?.some(
                                                            (p: any) => p.id === proj.id || p === proj.id
                                                        ) && (
                                                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                                                    Assigned
                                                                </span>
                                                            )}
                                                    </label>
                                                ))
                                            ) : (
                                                <p className="text-sm text-slate-500 text-center py-2">
                                                    No projects available
                                                </p>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-500 mt-2">
                                            Pilih project yang ingin diassign ke collaborator ini.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button
                                        className="bg-gray-300 hover:bg-gray-400"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                        onClick={handleSaveEdit}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}