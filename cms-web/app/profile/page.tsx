"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
    Pencil,
    User,
    Mail,
    Building2,
    Briefcase,
    Globe,
    MapPin,
    Shield,
    UserCircle2,
    Lock,
} from "lucide-react";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Anda belum login!");
            return;
        }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.profile) {
                    setUser(data.profile);
                    setFormData({
                        full_name: data.profile.full_name || "",
                        username: data.profile.username || "",
                        email: data.profile.email || "",
                        address: data.profile.address || "",
                        company: data.profile.company || "",
                        job: data.profile.job || "",
                        country: data.profile.country || "",
                        role: data.profile.role || "User",
                    });
                    if (data.profile.photo) {
                        setPhotoPreview(`${process.env.NEXT_PUBLIC_API_URL}${data.profile.photo}`);
                    }
                } else toast.error("Profile not found");
            })
            .catch(() => toast.error("Gagal mengambil data profil"))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        const token = localStorage.getItem("token");
        if (!token) return toast.error("Anda belum login!");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const result = await res.json();
            if (res.ok) {
                toast.success("Profil berhasil diperbarui!");
                setUser({ ...user, ...formData });
                setEditMode(false);
            } else toast.error(result.message || "Gagal memperbarui profil");
        } catch {
            toast.error("Terjadi kesalahan server");
        }
    };

    const handlePhotoUpload = async () => {
        const token = localStorage.getItem("token");
        if (!selectedPhoto || !token) return toast.error("Pilih foto terlebih dahulu!");

        const formData = new FormData();
        formData.append("photo", selectedPhoto);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/photo`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const result = await res.json();
            if (res.ok) {
                toast.success("Foto profil berhasil diperbarui!");
                setPhotoPreview(`${process.env.NEXT_PUBLIC_API_URL}${result.photo}`);
                setUser({ ...user, photo: result.photo });
                setSelectedPhoto(null);
            } else toast.error(result.message || "Gagal mengunggah foto");
        } catch {
            toast.error("Terjadi kesalahan saat upload foto");
        }
    };

    const handlePhotoDelete = async () => {
        const token = localStorage.getItem("token");
        if (!token) return toast.error("Anda belum login!");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/photo`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                // jika response bukan JSON atau status error
                const text = await res.text();
                console.error("DELETE error response:", text);
                toast.error("Gagal menghapus foto");
                return;
            }

            const result = await res.json();
            toast.success(result.message || "Foto profil dihapus");
            setPhotoPreview("/react.png");
            setUser({ ...user, photo: null });
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan saat menghapus foto");
        }
    };

    if (loading) return <p className="p-10 text-center text-slate-600">Memuat data profil...</p>;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-col flex-1 ml-64">
                <Topbar />
                    <Toaster position="top-center" />

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="p-8 min-h-[calc(100vh-4rem)]"
                    >
                        <div className="max-w-5xl mx-auto bg-white border border-blue-100 rounded-2xl shadow-md p-8">
                            {/* Header Profile */}
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 border-b pb-8">
                                <div className="relative">
                                    <Image
                                        src={photoPreview || "/react.png"}
                                        alt="Profile"
                                        width={140}
                                        height={140}
                                        className="rounded-full border-4 border-blue-200 shadow-md object-cover aspect-square"
                                    />
                                    {editMode && (
                                        <>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full shadow-md hover:bg-blue-700 transition"
                                            >
                                                <Pencil className="text-white w-4 h-4" />
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        const file = e.target.files[0];
                                                        if (file.size > 2 * 1024 * 1024) {
                                                            toast.error("Ukuran foto maksimal 2MB");
                                                            return;
                                                        }
                                                        setSelectedPhoto(file);
                                                        setPhotoPreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                            />
                                        </>
                                    )}
                                </div>

                                <div className="flex flex-col flex-1">
                                    <h1 className="text-2xl font-bold text-blue-800">{formData.full_name}</h1>
                                    <p className="text-slate-500">{formData.email}</p>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {formData.job || "-"} • {formData.company || "Perusahaan tidak diketahui"}
                                    </p>

                                    {editMode && selectedPhoto && (
                                        <Button
                                            onClick={handlePhotoUpload}
                                            className="w-fit mt-4 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1 rounded-md"
                                        >
                                            Simpan Foto
                                        </Button>
                                    )}
                                </div>

                                {editMode && user?.photo && (
                                    <Button
                                        onClick={handlePhotoDelete}
                                        className="w-fit mt-2 bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-1 rounded-md"
                                    >
                                        Hapus Foto
                                    </Button>
                                )}

                                <div className="ml-auto">
                                    {!editMode ? (
                                        <Button
                                            onClick={() => setEditMode(true)}
                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-lg shadow-sm"
                                        >
                                            Edit Profil
                                        </Button>
                                    ) : (
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={handleSave}
                                                className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-5 py-2 rounded-lg shadow-sm"
                                            >
                                                Simpan
                                            </Button>
                                            <Button
                                                onClick={() => setEditMode(false)}
                                                className="bg-gray-200 text-slate-700 hover:bg-gray-300 px-5 py-2 rounded-lg"
                                            >
                                                Batal
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Form Grid */}
                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    { label: "Nama Lengkap", key: "full_name" },
                                    { label: "Username", key: "username" },
                                    { label: "Email", key: "email" },
                                    { label: "Perusahaan", key: "company" },
                                    { label: "Pekerjaan", key: "job" },
                                    { label: "Negara", key: "country" },
                                    { label: "Alamat", key: "address" },
                                    { label: "Role / Jabatan", key: "role" },
                                ].map((field) => (
                                    <ProfileField
                                        key={field.key}
                                        label={field.label}
                                        name={field.key}
                                        value={formData[field.key]}
                                        editMode={editMode}
                                        onChange={handleChange}
                                    />
                                ))}
                            </div>
                        </div>

                    </motion.div>
            </div>

        </div>

    );
}

function ProfileField({
    label,
    name,
    value,
    editMode,
    onChange,
}: {
    label: string;
    name: string;
    value: string;
    editMode: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    const icons: Record<string, any> = {
        full_name: <User className="w-5 h-5 text-blue-500" />,
        username: <UserCircle2 className="w-5 h-5 text-blue-500" />,
        email: <Mail className="w-5 h-5 text-blue-500" />,
        company: <Building2 className="w-5 h-5 text-blue-500" />,
        job: <Briefcase className="w-5 h-5 text-blue-500" />,
        country: <Globe className="w-5 h-5 text-blue-500" />,
        address: <MapPin className="w-5 h-5 text-blue-500" />,
        role: <Shield className="w-5 h-5 text-blue-500" />,
    };

    const isReadOnly = name === "role";

    return (
        <div className="flex flex-col gap-2">
            <p className="font-semibold text-slate-700 text-sm">{label}</p>

            <div
                className={`flex items-center gap-3 border rounded-lg px-4 py-2 transition-all ${editMode && !isReadOnly
                    ? "border-blue-400 bg-blue-50 focus-within:ring-2 focus-within:ring-blue-300"
                    : "border-gray-200 bg-gray-50"
                    }`}
            >
                {icons[name]}
                {editMode && !isReadOnly ? (
                    <input
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={`Masukkan ${label.toLowerCase()}`}
                        className="flex-1 bg-transparent outline-none text-slate-800"
                    />
                ) : (
                    <div className="flex justify-between items-center w-full">
                        <p className="text-slate-700">{value || "-"}</p>
                        {isReadOnly && <Lock className="w-4 h-4 text-gray-400" />}
                    </div>
                )}
            </div>
        </div>
    );
}
