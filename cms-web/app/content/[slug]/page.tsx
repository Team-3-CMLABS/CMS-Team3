"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FiSave } from "react-icons/fi";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const normalizeToArray = (value: any): any[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
};

export default function ContentEditorPage() {
    const { slug } = useParams();

    const [fields, setFields] = useState<any[]>([]);
    const [contentData, setContentData] = useState<Record<string, any>>({});
    const [status, setStatus] = useState("draft");
    const [mediaPreview, setMediaPreview] =
        useState<Record<string, string[]>>({});

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

    useEffect(() => {
        if (!fields.length) return;

        const previews: Record<string, string[]> = {};

        fields.forEach((field) => {
            if (field.type === "media") {
                const values = normalizeToArray(contentData[field.name]);

                previews[field.name] = values
                    .map(resolvePreviewUrl)
                    .filter(Boolean) as string[];
            }
        });

        setMediaPreview(previews);
    }, [fields, contentData]);

    // 🔹 Handle perubahan input field dinamis
    const handleChange = (name: string, value: any) => {
        setContentData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // 🔹 Simpan ke backend
    const handleSave = async () => {
        const token = localStorage.getItem("token");
        const formData = new FormData();

        formData.append("status", status);

        Object.entries(contentData).forEach(([key, value]) => {
            const values = normalizeToArray(value);

            // 🔹 FILE BARU
            values.forEach((v) => {
                if (v instanceof File) {
                    formData.append(key, v);
                }
            });

            // 🔹 DATA NON-FILE (TEXT, RICHTEXT, NUMBER, URL FILE LAMA)
            const nonFile = values.filter((v) => !(v instanceof File));

            formData.append(key, JSON.stringify(nonFile.length > 1 ? nonFile : nonFile[0]));
        });

        await fetch(`http://localhost:4000/api/content/${slug}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        Swal.fire("Berhasil", "Konten disimpan", "success");
    };

    const resolvePreviewUrl = (item: any) => {
        if (!item) return null;

        if (typeof item === "string") {
            return item.startsWith("blob:")
                ? item
                : `http://localhost:4000${item}`;
        }

        if (item instanceof File) {
            return URL.createObjectURL(item);
        }

        return null;
    };

    const formatDateTimeLocal = (value: string) => {
        if (!value) return "";
        return value.replace(" ", "T").slice(0, 16);
    };

    const extractLatLng = (url: string) => {
        if (!url) return null;

        // format ?q=-7.95,112.61
        const match = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match) {
            return {
                lat: parseFloat(match[1]),
                lng: parseFloat(match[2]),
            };
        }

        return null;
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
                        value={value !== undefined && value !== null ? String(value) : ""}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                );

            case "datetime":
                return (
                    <input
                        type="datetime-local"
                        value={value ? value.replace(" ", "T").slice(0, 16) : ""}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                );

            case "location": {
                const loc = value || {};

                return (
                    <div className="space-y-3">

                        {/* URL INPUT */}
                        <input
                            type="text"
                            placeholder="Nama Tempat (contoh: Warung Pecel Blitar)"
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                            value={loc.name || ""}
                            onChange={(e) =>
                                handleChange(field.name, {
                                    ...loc,
                                    name: e.target.value,
                                })
                            }
                        />
                        
                        <input
                            type="url"
                            placeholder="Paste URL Google Maps di sini"
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                            value={loc.url || ""}
                            onChange={(e) => {
                                const url = e.target.value;
                                const coords = extractLatLng(url);

                                handleChange(field.name, {
                                    url,
                                    lat: coords?.lat || null,
                                    lng: coords?.lng || null,
                                });
                            }}
                        />

                        {/* BUTTON PICK MAP */}
                        <div className="flex gap-3">
                            <a
                                href="https://www.google.com/maps"
                                target="_blank"
                                className="text-sm text-blue-600 hover:underline"
                            >
                                📍 Pilih dari Google Maps
                            </a>

                            {loc.url && (
                                <a
                                    href={loc.url}
                                    target="_blank"
                                    className="text-sm text-green-600 hover:underline"
                                >
                                    🔗 Buka Lokasi
                                </a>
                            )}
                        </div>

                        {/* EMBED MAP */}
                        {loc.lat && loc.lng && (
                            <iframe
                                src={`https://www.google.com/maps?q=${loc.lat},${loc.lng}&z=15&output=embed`}
                                className="w-full h-64 rounded-lg border"
                                loading="lazy"
                            />
                        )}
                    </div>
                );
            }

            case "media": {
                const previews = mediaPreview[field.name] || [];

                return (
                    <div className="space-y-3">
                        {/* PREVIEW */}
                        <div className="flex gap-3 flex-wrap">
                            {previews.map((url, idx) => (
                                <div key={idx} className="relative">
                                    <img
                                        src={url}
                                        className="w-40 h-28 object-cover rounded-md border"
                                    />

                                    {/* DELETE */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setContentData((prev) => ({
                                                ...prev,
                                                [field.name]: normalizeToArray(prev[field.name]).filter(
                                                    (_: any, i: number) => i !== idx
                                                ),
                                            }));
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full text-xs"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* INPUT */}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                setContentData((prev) => ({
                                    ...prev,
                                    [field.name]: [
                                        ...normalizeToArray(prev[field.name]),
                                        file,
                                    ],
                                }));
                            }}
                        />
                    </div>
                );
            }
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
                                fields.map((field, index) => (
                                    <div key={`${field.name}-${index}`}>
                                        <label className="text-sm font-medium text-slate-600 capitalize">
                                            {field.name}
                                        </label>
                                        <div className="mt-1">
                                            {renderInput(field)}
                                        </div>
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
