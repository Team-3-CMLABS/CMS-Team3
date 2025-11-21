"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FiSave } from "react-icons/fi";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function ContentEditorPage() {
    const { slug } = useParams();

    const [fields, setFields] = useState<any[]>([]);
    const [contentData, setContentData] = useState<Record<string, any>>({});
    const [status, setStatus] = useState("draft");

    // 🔹 Ambil field & data konten berdasarkan slug
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch(`http://localhost:4000/api/content/${slug}`);
                const data = await res.json();

                if (!res.ok || !data.model) {
                    Swal.fire("Error", "Model tidak ditemukan.", "error");
                    return;
                }

                setFields(data.fields || []);

                // isi default dari backend (jika ada)
                const raw = data.content?.raw || {};
                setContentData(raw);
                setStatus(data.content?.status || "draft");
            } catch (err) {
                console.error("Gagal mengambil data konten:", err);
                Swal.fire("Error", "Gagal memuat data konten.", "error");
            }
        };
        if (slug) fetchContent();
    }, [slug]);

    // 🔹 Handle perubahan input field dinamis
    const handleChange = (name: string, value: any) => {
        setContentData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // 🔹 Simpan ke backend
    const handleSave = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/content/${slug}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: contentData,
                    status,
                }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Gagal menyimpan konten");

            Swal.fire("Berhasil!", "Konten berhasil disimpan.", "success");
        } catch (err: any) {
            Swal.fire("Error", err.message, "error");
        }
    };

    // 🔹 Render field input dinamis berdasarkan tipe
    const renderInput = (field: any) => {
        const value = contentData[field.name] || "";

        switch (field.type) {
            case "text":
            case "richtext":
                return (
                    <textarea
                        rows={field.type === "richtext" ? 5 : 2}
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder={`Masukkan ${field.name}...`}
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                );

            case "number":
                return (
                    <input
                        type="number"
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                );

            case "datetime":
                return (
                    <input
                        type="datetime-local"
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                );

            case "media":
                return (
                    <input
                        type="text"
                        placeholder="URL media..."
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                );

            case "location":
                return (
                    <input
                        type="text"
                        placeholder="Masukkan lokasi..."
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                );

            default:
                return (
                    <input
                        type="text"
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                );
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-col flex-1 ml-64">
                <Topbar />

                <main className="flex-1 overflow-auto p-6">
                    <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-10">
                        <div className="mb-8 border-b border-slate-200 pb-3">
                            <h1 className="text-2xl font-bold text-slate-800 capitalize">
                                {slug} Page
                            </h1>
                            <p className="text-slate-500 text-sm">
                                Isi dan ubah konten halaman ini.
                            </p>
                        </div>

                        {/* Field Dinamis dari DB */}
                        <div className="space-y-6">
                            {fields.length === 0 ? (
                                <p className="text-slate-400 text-sm">
                                    Belum ada field untuk model ini.
                                </p>
                            ) : (
                                fields.map((field) => (
                                    <div key={field.name}>
                                        <label className="text-sm font-medium text-slate-600 capitalize">
                                            {field.name}
                                        </label>
                                        <div className="mt-1">{renderInput(field)}</div>
                                    </div>
                                ))
                            )}

                            {/* Status Konten */}
                            <div className="border-t border-slate-200 pt-4 mt-6">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                                    Status Konten
                                </h2>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>

                        {/* Tombol Simpan */}
                        <button
                            onClick={handleSave}
                            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md flex items-center gap-2"
                        >
                            <FiSave /> Simpan Konten
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}
