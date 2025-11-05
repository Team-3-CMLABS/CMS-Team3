"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FiUploadCloud, FiPlus, FiSave } from "react-icons/fi";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function ContentEditorPage() {
    const { slug } = useParams();

    const [contentData, setContentData] = useState({
        name: "",
        description: "",
        logo: null,
        menu: [],
        footerText: "",
        socials: [],
    });

    // Simulasi fetch data dari backend
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch(`http://localhost:4000/api/content/${slug}`);
                const data = await res.json();
                if (data && data.data) {
                    setContentData({
                        name: data.data.name || "",
                        description: data.data.description || "",
                        logo: data.data.logo || null,
                        menu: data.data.menu || [],
                        footerText: data.data.footerText || "",
                        socials: data.data.socials || [],
                    });
                }
            } catch (err) {
                console.error("Gagal mengambil data konten:", err);
            }
        };
        fetchContent();
    }, [slug]);

    const handleChange = (e: any) => {
        setContentData({ ...contentData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/content/${slug}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: contentData,
                    status: "draft",
                }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            Swal.fire("Saved!", "Content berhasil disimpan.", "success");
        } catch (err: any) {
            Swal.fire("Error", err.message, "error");
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-col flex-1 ml-64">
                <Topbar />
                <main className="flex-1 overflow-auto p-6">
                    <div className="min-h-screen bg-[#f8fafc] py-10 px-8">
                        <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-10">
                            {/* ===== Header ===== */}
                            <div className="mb-8 border-b border-slate-200 pb-3">
                                <h1 className="text-2xl font-bold text-slate-800 capitalize">
                                    {slug} Page
                                </h1>
                                <p className="text-slate-500 text-sm">Build Your Content</p>
                            </div>

                            {/* ===== Content Fields ===== */}
                            <section>
                                <h2 className="text-lg font-semibold text-slate-800 border-b border-blue-200 pb-1 mb-6">
                                    Content
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Name</label>
                                        <input
                                            name="name"
                                            value={contentData.name}
                                            onChange={handleChange}
                                            className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                            placeholder="Enter page name"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-600">
                                            Description
                                        </label>
                                        <input
                                            name="description"
                                            value={contentData.description}
                                            onChange={handleChange}
                                            className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                            placeholder="Short description..."
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* ===== Header Section ===== */}
                            <section className="mt-10">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                                    Header Section
                                </h2>

                                {/* Navbar Box */}
                                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-slate-700 text-sm">Navbar</h3>
                                    </div>

                                    {/* Logo Upload */}
                                    <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center bg-white">
                                        <FiUploadCloud className="mx-auto text-blue-500 text-2xl mb-2" />
                                        <p className="text-slate-500 text-sm">
                                            Click or drag to upload logo
                                        </p>
                                    </div>

                                    {/* Menu */}
                                    <div className="mt-4">
                                        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-md">
                                            <FiPlus size={14} /> Add Menu Link
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* ===== Footer Section ===== */}
                            <section className="mt-10">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                                    Footer Section
                                </h2>

                                {/* Footer Box */}
                                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-slate-700 text-sm">Footer</h3>
                                    </div>

                                    {/* Text Copyright */}
                                    <div className="mb-3">
                                        <label className="text-sm text-slate-600 font-medium">
                                            Text / Copyright
                                        </label>
                                        <input
                                            name="footerText"
                                            value={contentData.footerText}
                                            onChange={handleChange}
                                            className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                            placeholder="© 2025 Your Company"
                                        />
                                    </div>

                                    {/* Sosial Media */}
                                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-md">
                                        <FiPlus size={14} /> Add Social Media
                                    </button>
                                </div>
                            </section>
                            <button
                                onClick={handleSave}
                                className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md flex items-center gap-2"
                            >
                                <FiSave /> Save Content
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
