"use client";

import { useState } from "react";
import { Upload, Search, Trash2 } from "lucide-react";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

interface MediaItem {
    id: number;
    name: string;
    url: string;
}

const initialMedia: MediaItem[] = [
    { id: 1, name: "google.png", url: "/google.png" },
    { id: 2, name: "react.png", url: "/react.png" },
    { id: 3, name: "logo.png", url: "/logo.png" },
];

export default function MediaLibraryPage() {
    const [media, setMedia] = useState<MediaItem[]>(initialMedia);
    const [search, setSearch] = useState("");

    const filteredMedia = media.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newMedia: MediaItem = {
                id: media.length + 1,
                name: file.name,
                url: URL.createObjectURL(file),
            };
            setMedia([newMedia, ...media]);
        }
    };

    const handleDelete = (id: number) => {
        setMedia(media.filter((item) => item.id !== id));
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-col flex-1 ml-64">
                <Topbar />
                <main className="p-6 flex-1 overflow-auto">
                    {/* Main Card Wrapper */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        {/* Header: Title + Controls */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                            <div>
                                <h1 className="text-2xl font-semibold text-slate-800">
                                    Media Library
                                </h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    Manage and monitor your media assets.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Search Input */}
                                <div className="relative">
                                    <Search
                                        className="absolute left-2.5 top-2.5 text-slate-400 w-4 h-4"
                                        size={16}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search media..."
                                        className="border border-slate-300 text-sm pl-8 pr-3 py-1.5 rounded-md focus:ring-2 focus:ring-blue-400 outline-none w-full sm:w-64"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                {/* Upload Button */}
                                <label className="flex items-center gap-2 bg-blue-600 text-white text-sm px-5 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition cursor-pointer">
                                    <Upload size={16} />
                                    <span>Upload</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleUpload}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Media Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {filteredMedia.length > 0 ? (
                                filteredMedia.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-xl border border-slate-200 shadow hover:shadow-lg transition overflow-hidden relative group"
                                    >
                                        <img
                                            src={item.url}
                                            alt={item.name}
                                            className="w-full h-32 object-cover"
                                        />
                                        <div className="p-2 text-sm text-slate-700 truncate">
                                            {item.name}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition"
                                        >
                                            <Trash2 size={14} />
                                        </button>
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