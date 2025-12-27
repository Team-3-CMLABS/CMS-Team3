"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Trash2, ChevronDown, Filter } from "lucide-react";
import Swal from "sweetalert2";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

/* ===================== TYPES ===================== */
interface MediaItem {
    id: number;
    filename: string;
    url: string;
    uploader?: {
        name: string;
        email: string;
    } | null;
    content_slug?: string | null;
    created_at?: string;
}

/* ===================== BADGE COLOR ===================== */
const contentColorMap: Record<string, string> = {
    "home-page": "bg-blue-50 text-blue-600",
    "media-page": "bg-green-50 text-green-600",
    "blog-page": "bg-orange-50 text-orange-600",
    "landing-page": "bg-purple-50 text-purple-600",
    "educate-page": "bg-teal-50 text-teal-600",
    "about-page": "bg-pink-50 text-pink-600",
};

const getContentBadgeColor = (slug?: string | null) =>
    contentColorMap[slug ?? ""] || "bg-slate-100 text-slate-600";

/* ===================== USER ROLE ===================== */
const user =
    typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null")
        : null;

const isAdmin = user?.role === "admin";

/* ===================== TOAST ===================== */
const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
});

/* ===================== PAGE ===================== */
export default function MediaLibraryPage() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("");

    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    /* ===================== FETCH MEDIA ===================== */
    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const res = await fetch("http://localhost:4000/api/media", {
                    headers: {
                        Authorization: `Bearer ${token}`, 
                    },
                });

                const json = await res.json();
                const list = Array.isArray(json) ? json : json.media || []; 

                setMedia(
                    list.map((item: any) => ({
                        id: item.id,
                        filename: item.filename,
                        url: `http://localhost:4000${item.url}`,
                        uploader: item.uploader || null,
                        content_slug: item.content_slug || null,
                        created_at: item.created_at,
                    }))
                );
            } catch (err) {
                console.error("Gagal load media:", err);
                setMedia([]); 
            }
        };

        fetchMedia();
    }, [token]);

    /* ===================== DELETE ===================== */
    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Hapus media?",
            text: "Media yang dihapus tidak bisa dikembalikan",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
        });

        if (!result.isConfirmed) return;

        try {
            await fetch(`http://localhost:4000/api/media/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            setMedia((prev) => prev.filter((item) => item.id !== id));

            Toast.fire({
                icon: "success",
                title: "Media berhasil dihapus",
            });
        } catch {
            Toast.fire({
                icon: "error",
                title: "Gagal menghapus media",
            });
        }
    };

    /* ===================== FILTER OPTIONS ===================== */
    const contentOptions = useMemo(
        () =>
            Array.from(
                new Set(media.map((m) => m.content_slug).filter(Boolean))
            ) as string[],
        [media]
    );

    const editorOptions = useMemo(
        () =>
            Array.from(
                new Set(media.map((m) => m.uploader?.name).filter(Boolean))
            ) as string[],
        [media]
    );

    /* ===================== FILTERED DATA ===================== */
    const filteredMedia = media.filter((item) => {
        const matchSearch =
            item.filename.toLowerCase().includes(search.toLowerCase()) ||
            item.uploader?.name.toLowerCase().includes(search.toLowerCase()) ||
            item.content_slug?.toLowerCase().includes(search.toLowerCase());

        if (!filter) return matchSearch;

        const [type, value] = filter.split(":");

        if (type === "content")
            return matchSearch && item.content_slug === value;

        if (type === "editor")
            return matchSearch && item.uploader?.name === value;

        return matchSearch;
    });

    /* ===================== UI ===================== */
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-col flex-1 ml-64">
                <Topbar />

                <main className="p-6 flex-1 overflow-auto">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                            {/* Left */}
                            <div>
                                <h1 className="text-2xl font-semibold text-slate-800">
                                    Media Library
                                </h1>
                                <p className="text-sm text-slate-500">
                                    Monitor all uploaded media from contents.
                                </p>
                            </div>

                            {/* Right */}
                            <div className="flex gap-3 items-center justify-end">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="border border-slate-300 text-sm pl-8 pr-3 py-1.5 rounded-md focus:ring-2 focus:ring-blue-400 outline-none w-56"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                {/* Single Filter */}
                                <div className="relative">
                                    <Filter className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <select
                                        className="appearance-none border border-slate-300 text-sm pl-8 pr-8 py-1.5 rounded-md focus:ring-2 focus:ring-blue-400"
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                    >
                                        <option value="">All Media</option>

                                        <optgroup label="By Content">
                                            {contentOptions.map((slug) => (
                                                <option key={slug} value={`content:${slug}`}>
                                                    {slug}
                                                </option>
                                            ))}
                                        </optgroup>

                                        <optgroup label="By Editor">
                                            {editorOptions.map((name) => (
                                                <option key={name} value={`editor:${name}`}>
                                                    {name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Media Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {filteredMedia.length > 0 ? (
                                filteredMedia.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden relative group"
                                    >
                                        <img
                                            src={item.url}
                                            alt={item.filename}
                                            className="w-full h-32 object-cover"
                                        />

                                        <div className="p-2 text-xs space-y-1">
                                            <p className="font-medium truncate text-slate-800">
                                                {item.filename}
                                            </p>

                                            {item.uploader && (
                                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-600">
                                                    👤 {item.uploader.name}
                                                </span>
                                            )}

                                            {item.content_slug && (
                                                <span
                                                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] ${getContentBadgeColor(
                                                        item.content_slug
                                                    )}`}
                                                >
                                                    📄 {item.content_slug}
                                                </span>
                                            )}

                                            {item.created_at && (
                                                <p className="text-[10px] text-slate-400">
                                                    {new Date(item.created_at).toLocaleDateString("id-ID")}
                                                </p>
                                            )}
                                        </div>

                                        {/* Delete only admin */}
                                        {isAdmin || item.uploader?.email === user?.email ? (
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        ) : null}
                                    </div>
                                ))
                            ) : (
                                <p className="col-span-full text-center text-slate-500">
                                    No media found.
                                </p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}