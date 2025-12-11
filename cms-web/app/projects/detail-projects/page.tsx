"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Trash2, UserPlus } from "lucide-react";
import Swal from "sweetalert2";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DetailProjectsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const projectId = searchParams?.get("id");

    const [project, setProject] = useState<any>(null);
    const [collaborators, setCollaborators] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProjectDetails = useCallback(() => {
        if (!projectId) return;
        setLoading(true);
        fetch(`http://localhost:4000/api/projects/${projectId}`)
            .then((res) => res.json())
            .then((data) => {
                if (!data) {
                    setLoading(false);
                    setProject(null);
                    return;
                }
                const mapped = {
                    ...data,
                    lastUpdate: data.last_update ?? data.lastUpdate ?? "",
                    projectId: data.id ?? data.projectId,
                    domain: data.domain ?? "",
                };
                setProject(mapped);
                setCollaborators(mapped.collaborators ?? []);
                setLoading(false);
            })
            .catch(() => {
                setProject({
                    id: projectId,
                    name: "CMS CMLabs",
                    lastUpdate: "15 Minute ago",
                    status: "Progress",
                    projectId: "12345",
                    domain: "cms-cmlabs.cmscmlabs.com",
                });
                setCollaborators([]);
                setLoading(false);
            });
    }, [projectId]);

    useEffect(() => {
        fetchProjectDetails();
    }, [fetchProjectDetails]);

    const handleInlineUpdate = async (field: "name" | "status", value: string) => {
        try {
            const body = field === "name" ? { name: value } : { status: value };
            const res = await fetch(`http://localhost:4000/api/projects/${projectId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Gagal update project");
            }

            setProject((prev: any) => ({ ...prev, [field]: value }));
        } catch (err: any) {
            console.error("Update inline gagal:", err);
            Swal.fire("Error", err.message || "Gagal mengupdate", "error");
        }
    };

    const handleChangeName = async () => {
        const { value: newName } = await Swal.fire({
            title: "Change Project Name",
            input: "text",
            inputLabel: "Project Name",
            inputValue: project?.name ?? "",
            showCancelButton: true,
        });
        if (newName && newName !== project?.name) {
            await handleInlineUpdate("name", newName);
            Swal.fire("Saved", "Project name berhasil diubah", "success");
        }
    };

    const handleChangeStatus = async () => {
        const { value } = await Swal.fire({
            title: "Change Status",
            input: "select",
            inputOptions: {
                "To Do": "To Do",
                "In Progress": "In Progress",
                Completed: "Completed",
            },
            inputValue: project?.status ?? "To Do",
            showCancelButton: true,
        });
        if (value && value !== project?.status) {
            await handleInlineUpdate("status", value);
            Swal.fire("Saved", "Status berhasil diubah", "success");
        }
    };

    const handleAddCollaborator = async () => {
        try {
            // ambil semua collaborator yang sudah terdaftar
            const res = await fetch(`http://localhost:4000/api/collaborators`);
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Gagal memuat daftar collaborator");
            }

            const data = await res.json();
            const allCollaborators = data.data || [];

            if (allCollaborators.length === 0) {
                return Swal.fire("Info", "Belum ada collaborator yang terdaftar.", "info");
            }

            // siapkan daftar pilihan email untuk popup
            const inputOptions = allCollaborators.reduce((acc: any, c: any) => {
                acc[c.id] = `${c.name} (${c.email})`;
                return acc;
            }, {});

            // tampilkan popup untuk memilih collaborator
            const { value: selectedId } = await Swal.fire({
                title: "Pilih Collaborator",
                input: "select",
                inputOptions,
                showCancelButton: true,
                confirmButtonText: "Tambahkan",
                cancelButtonText: "Batal",
            });

            if (selectedId) {
                const addRes = await fetch(
                    `http://localhost:4000/api/projects/${projectId}/add-collaborator`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ collaborator_id: selectedId }),
                    }
                );

                if (!addRes.ok) {
                    const errorData = await addRes.json().catch(() => ({}));
                    throw new Error(errorData.message || "Gagal menambahkan collaborator.");
                }

                Swal.fire("Berhasil", "Collaborator berhasil ditambahkan!", "success");
                fetchProjectDetails(); // refresh daftar collaborator di project
            }
        } catch (err: any) {
            console.error("Error adding collaborator:", err);
            Swal.fire("Error", err.message || "Terjadi kesalahan", "error");
        }
    };

    const handleRemoveCollaborator = async (collabId: number) => {
        try {
            const res = await fetch(
                `http://localhost:4000/api/projects/${project.id}/remove-collaborator`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ collaborator_id: collabId }),
                }
            );
            if (!res.ok) throw new Error("Gagal menghapus collaborator dari project");

            Swal.fire("Berhasil", "Collaborator dihapus dari project", "success");
            fetchProjectDetails();
        } catch (err: any) {
            console.error(err);
            Swal.fire("Error", err.message || "Terjadi kesalahan", "error");
        }
    };

    const handleDuplicateProject = async () => {
        const confirm = await Swal.fire({
            title: "Duplicate Project?",
            icon: "question",
            showCancelButton: true,
        });
        if (confirm.isConfirmed) {
            const res = await fetch(
                `http://localhost:4000/api/projects/${projectId}/duplicate`,
                { method: "POST" }
            );
            if (res.ok) {
                const data = await res.json();
                Swal.fire("Berhasil!", "Project berhasil diduplikasi.", "success");
                router.push(`/dashboard?duplicateId=${data.id}`);
            } else {
                Swal.fire("Error", "Gagal menduplikasi project", "error");
            }
        }
    };

    const handleDeleteProject = async () => {
        const confirm = await Swal.fire({
            title: "Hapus Project?",
            icon: "warning",
            showCancelButton: true,
        });
        if (confirm.isConfirmed) {
            const res = await fetch(`http://localhost:4000/api/projects/${projectId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                Swal.fire("Deleted", "Project dihapus", "success");
                router.push("/dashboard");
            } else {
                Swal.fire("Error", "Gagal menghapus", "error");
            }
        }
    };

    const Badge = ({ status }: { status: string }) => {
        if (status === "In Progress") {
            return (
                <span
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium"
                    style={{
                        background: "#FFF4DB",
                        color: "#C47F00",
                        border: "1px solid #F5C06A",
                    }}
                >
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 99,
                            background: "#F5C06A",
                            display: "inline-block",
                        }}
                    />
                    {status}
                </span>
            );
        }
        if (status === "Completed") {
            return (
                <span
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium"
                    style={{
                        background: "#DFF6DF",
                        color: "#187A21",
                        border: "1px solid #AEE2AE",
                    }}
                >
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 99,
                            background: "#49B24A",
                            display: "inline-block",
                        }}
                    />
                    {status}
                </span>
            );
        }
        return (
            <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium"
                style={{
                    background: "#F3F4F6",
                    color: "#6B7280",
                    border: "1px solid #E5E7EB",
                }}
            >
                <span
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: 99,
                        background: "#D1D5DB",
                        display: "inline-block",
                    }}
                />
                {status}
            </span>
        );
    };

    if (loading) return <p className="text-center py-10">Loading...</p>;
    if (!project) return <p className="text-center py-10">Project tidak ditemukan</p>;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64">
                <Topbar />
                <main className="p-8 max-w-6xl mx-auto">
                    <div className="space-y-6">

                        {/* Top small header like in image */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm tracking-widest text-gray-700">{project.name}</h3>
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md shadow text-sm"
                            >
                                Enter Project
                            </button>
                        </div>

                        {/* Card container */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 space-y-10">


                            {/* Information header (blue pill) */}
                            <div className="mb-4">
                                <div className="inline-block rounded-md px-4 py-2 text-white text-sm font-semibold" style={{ background: "#2F6FB6" }}>
                                    Information
                                </div>
                            </div>

                            {/* Information table-like card */}
                            <div className="rounded-lg border-2 border-gray-200 overflow-hidden">
                                <div className="grid grid-cols-12 gap-0 divide-x" style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                                    {/* Row 1 */}
                                    <div className="col-span-5 p-4 bg-white text-sm font-medium text-gray-600">Project ID</div>
                                    <div className="col-span-7 p-4 bg-white text-sm text-gray-800">{project.projectId}</div>
                                </div>

                                <div className="grid grid-cols-12 gap-0 divide-x" style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                                    {/* Row 2 */}
                                    <div className="col-span-5 p-4 bg-white text-sm font-medium text-gray-600">Project Name</div>
                                    <div className="col-span-7 p-4 bg-white text-sm text-gray-800 flex items-center justify-between">
                                        <span>{project.name}</span>
                                        <button onClick={handleChangeName} className="text-blue-600 hover:text-blue-800 text-sm underline">Change Name</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-12 gap-0 divide-x" style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                                    {/* Row 3 */}
                                    <div className="col-span-5 p-4 bg-white text-sm font-medium text-gray-600">Last Update</div>
                                    <div className="col-span-7 p-4 bg-white text-sm text-gray-800">{project.lastUpdate}</div>
                                </div>

                                <div className="grid grid-cols-12 gap-0">
                                    {/* Row 4 */}
                                    <div className="col-span-5 p-4 bg-white text-sm font-medium text-gray-600">Status Project</div>
                                    <div className="col-span-7 p-4 bg-white text-sm text-gray-800 flex items-center justify-between">
                                        <div>
                                            <Badge status={project.status} />
                                        </div>
                                        <button onClick={handleChangeStatus} className="text-blue-600 hover:text-blue-800 text-sm underline">Change Status</button>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Domain section */}
                            <div className="mt-6 rounded-lg overflow-hidden border-2 border-yellow-200">
                                <div className="px-4 py-3" style={{ background: "#FFDB9B" }}>
                                    <div className="text-sm font-semibold text-gray-900">Custom Domain</div>
                                </div>

                                <div className="p-6 bg-white">
                                    <p className="text-xs text-gray-500 mb-4">
                                        By default, your site on CMS cmlabs can be reached through a subdomain based on your project name. To make it more personalized, add your own custom domain
                                    </p>
                                    <div className="rounded-md p-4 border border-yellow-200 bg-white flex items-center justify-between">
                                        <div>
                                            <code className="text-sm font-semibold tracking-wider text-gray-800">{project.domain}</code>
                                        </div>
                                        <button className="px-4 py-2 rounded-md text-sm font-medium"
                                            style={{ background: "#F9C97A", color: "#8B4E05", border: "1px solid #F0B66A" }}>
                                            custom domain
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="mt-6 rounded-lg border-2 border-red-200 overflow-hidden">
                                <div className="px-4 py-3" style={{ background: "#F44336" }}>
                                    <div className="text-sm font-semibold text-white">Danger Zone</div>
                                </div>


                                <div className="p-6 bg-white">
                                    <div className="space-y-6">
                                        {/* Item 1 */}
                                        <div className="flex items-start justify-between">
                                            <div className="max-w-[85%]">
                                                <div className="text-sm font-semibold text-red-600">Duplicate Projects</div>
                                                <div className="text-xs text-gray-500 mt-1">You are about to duplicate this project. A new copy will be created with the same content and settings.</div>
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <button onClick={handleDuplicateProject}
                                                    className="w-10 h-10 rounded-md flex items-center justify-center"
                                                    style={{ background: "#FFEBEE", color: "#D32F2F" }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Item 2 */}
                                        <div className="flex items-start justify-between">
                                            <div className="max-w-[85%]">
                                                <div className="text-sm font-semibold text-red-600">Duplicate to Personal</div>
                                                <div className="text-xs text-gray-500 mt-1">You are about to transfer this project to another section. The original project will remain unchanged, while a duplicate will be created in the selected section.</div>
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <button
                                                    onClick={() => Swal.fire("Info", "Fungsi ini belum diimplementasikan pada demo", "info")}
                                                    className="w-10 h-10 rounded-md flex items-center justify-center"
                                                    style={{ background: "#FFEBEE", color: "#D32F2F" }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Item 3 */}
                                        <div className="flex items-start justify-between">
                                            <div className="max-w-[85%]">
                                                <div className="text-sm font-semibold text-red-600">Delete Projects</div>
                                                <div className="text-xs text-gray-500 mt-1">If you delete the organization, it will be permanently deleted and you cannot recover it.</div>
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <button onClick={handleDeleteProject}
                                                    className="w-10 h-10 rounded-md flex items-center justify-center"
                                                    style={{ background: "#FFEBEE", color: "#D32F2F" }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Collaborators block (mimic simpler card under main sections) */}
                            <div className="mt-6 rounded-lg border-2 border-green-200 p-4 overflow-hidden">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-gray-800">Collaborators</h4>
                                    <button onClick={handleAddCollaborator} className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-md text-sm">
                                        <UserPlus size={16} /> Add
                                    </button>
                                </div>

                                {collaborators.length === 0 ? (
                                    <p className="text-center py-6 text-gray-500">No collaborators yet.</p>
                                ) : (
                                    <div className="divide-y">
                                        {collaborators.map((c: any) => (
                                            <div key={c.id} className="flex items-center justify-between py-3">
                                                <div className="font-medium text-gray-800">{c.email}</div>
                                                <button
                                                    onClick={() => handleRemoveCollaborator(c.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
