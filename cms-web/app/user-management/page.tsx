"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Pencil, Trash2, Power, PowerOff, X, Loader2, Search, UserPlus, Filter } from "lucide-react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
});

export default function UserManagementPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        id: null,
        username: "",
        email: "",
        role: "viewer",
        status: "active",
        password: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<any>(null);

    const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const safeFetch = async (url: string, opts: RequestInit = {}, timeout = 8000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        try {
            const res = await fetch(url, { ...opts, signal: controller.signal });
            clearTimeout(id);

            const contentType = res.headers.get("content-type") || "";
            const text = await res.text();

            // Log untuk debugging
            console.log("=== FETCH DEBUG ===");
            console.log("URL:", url);
            console.log("Method:", opts.method || "GET");
            console.log("Status:", res.status, res.statusText);
            console.log("Content-Type:", contentType);
            console.log("Response Text (first 200 chars):", text.substring(0, 200));
            console.log("==================");

            if (contentType.includes("text/html")) {
                throw new Error(`Server mengembalikan HTML, bukan JSON. Status: ${res.status}`);
            }

            let json;
            try {
                json = text ? JSON.parse(text) : {};
            } catch (parseErr) {
                console.error("JSON Parse Error:", parseErr);
                console.error("Raw text:", text);
                throw new Error(`Gagal parse JSON. Response: ${text.substring(0, 100)}`);
            }

            return { res, json };
        } catch (err: any) {
            clearTimeout(id);
            console.error("Fetch error:", err);
            throw err;
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        const token = getToken();
        if (!token) {
            toast.error("Sesi login habis, silakan login ulang");
            router.push("/login");
            setUsers([]);
            setLoading(false);
            return;
        }
        try {
            const { res, json } = await safeFetch(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            }, 8000);

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    toast.error("Token tidak valid, login ulang!");
                    localStorage.removeItem("token");
                    router.push("/login");
                    return;
                }
                throw new Error(json?.error || "Gagal mengambil data pengguna");
            }
            setUsers(json || []);
        } catch (err: any) {
            console.error("fetchUsers err:", err);
            toast.error(err.message || "Gagal mengambil data pengguna");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const openFormModal = (user?: any) => {
        if (user) {
            setForm({
                id: user.id_user ?? user.id,
                username: user.username ?? user.nama_user ?? "",
                email: user.email ?? "",
                role: user.role ?? "viewer",
                status: user.status ?? "ACTIVE",
                password: "",
            });
            setIsEditing(true);
            toast("Mode edit aktif ✏️");
        } else {
            setForm({ id: null, username: "", email: "", role: "viewer", status: "ACTIVE", password: "" });
            setIsEditing(false);
        }
        setShowFormModal(true);
    };

    const closeFormModal = () => {
        setShowFormModal(false);
        setForm({ id: null, username: "", email: "", role: "viewer", status: "ACTIVE", password: "" });
        setIsEditing(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const token = getToken();

        if (!token) {
            Swal.fire("Error", "Sesi login habis, silakan login ulang.", "error");
            return;
        }

        if (!form.username || !form.email) {
            Swal.fire("Error", "Username dan email wajib diisi", "error");
            return;
        }

        if (!form.password && !isEditing) {
            Swal.fire("Error", "Password wajib diisi", "error");
            return;
        }

        const url = isEditing ? `${API_URL}/${form.id}` : API_URL;
        const method = isEditing ? "PUT" : "POST";

        try {
            console.log("Submitting form:", { url, method, form });

            const { res, json } = await safeFetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form),
            }, 10000);

            console.log("Submit response:", {
                status: res.status,
                ok: res.ok,
                json: json,
                jsonType: typeof json,
                jsonKeys: json ? Object.keys(json) : []
            });

            if (!res.ok) {
                const errorMsg = json?.error || json?.message || "Gagal menyimpan user";
                throw new Error(errorMsg);
            }

            // Success - gunakan message dari response
            const successMsg = json?.message || (isEditing ? "User berhasil diperbarui" : "User berhasil ditambahkan");
            toast.success(successMsg);

            await fetchUsers();
            closeFormModal();
        } catch (err: any) {
            console.error("handleSubmit err:", err);

            // Tampilkan error yang jelas
            const errorMessage = err.message || "Gagal menyimpan user";

            Swal.fire({
                icon: "error",
                title: "Gagal menyimpan user",
                text: errorMessage,
                footer: '<small>Periksa console browser (F12) untuk detail lengkap</small>'
            });
        }
    };

    const openDeleteModal = (user: any) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setUserToDelete(null);
        setShowDeleteModal(false);
    };

    const handleDelete = async (user: any) => {
        const token = getToken();
        if (!token) {
            Toast.fire({ icon: "warning", title: "Sesi habis, silakan login ulang." });
            return;
        }

        const userId = user.id_user ?? user.id;
        setDeleting(true);

        try {
            const { res, json } = await safeFetch(
                `${API_URL}/${userId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
                8000
            );

            if (!res.ok) {
                if (json?.error?.includes("menghapus akun sendiri")) {
                    Toast.fire({ icon: "info", title: "Tidak bisa menghapus akun sendiri." });
                } else if (json?.error?.includes("tidak ditemukan")) {
                    Toast.fire({ icon: "error", title: "User tidak ditemukan." });
                } else {
                    Toast.fire({ icon: "error", title: json?.error || "Gagal menghapus akun." });
                }
                return;
            }

            Toast.fire({ icon: "success", title: json?.message || "Akun berhasil dihapus." });
            setUsers((prev) => prev.filter((u) => (u.id_user ?? u.id) !== userId));
            closeDeleteModal();
        } catch (err: any) {
            console.error("delete user err:", err);
            Toast.fire({ icon: "error", title: err.message || "Terjadi kesalahan saat menghapus akun." });
        } finally {
            setDeleting(false);
        }
    };

    const handleToggleActive = async (user: any) => {
        const token = getToken();
        if (!token) {
            Toast.fire({ icon: "warning", title: "Sesi habis, silakan login ulang." });
            return;
        }

        try {
            const userId = user.id_user ?? user.id;
            const { res, json } = await safeFetch(
                `${API_URL}/${userId}/toggle-active`,
                {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}` },
                },
                8000
            );

            if (!res.ok) {
                if (res.status === 403) {
                    Toast.fire({ icon: "error", title: json?.error || "Tidak bisa menonaktifkan akun sendiri." });
                    return;
                }
                Toast.fire({ icon: "error", title: json?.error || "Gagal mengubah status akun." });
                return;
            }

            Toast.fire({ icon: "success", title: json?.message || "Status akun diperbarui!" });
            setUsers((prev) =>
                prev.map((u) =>
                    (u.id_user ?? u.id) === userId
                        ? { ...u, is_active: json.is_active }
                        : u
                )
            );
        } catch (err: any) {
            console.error("toggleActive err:", err);
            Toast.fire({ icon: "error", title: err.message || "Terjadi kesalahan saat toggle status." });
        }
    };

    const [showPassword, setShowPassword] = useState(false);
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortOption, setSortOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = users
        .filter((user) => {
            const matchRole = roleFilter ? user.role === roleFilter : true;
            const isActive = Number(user.is_active) === 1;
            const matchStatus =
                statusFilter === "active"
                    ? isActive
                    : statusFilter === "inactive"
                        ? !isActive
                        : true;
            const matchSearch =
                user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchRole && matchStatus && matchSearch;
        })
        .sort((a, b) => {
            if (sortOption === "az") return a.username.localeCompare(b.username);
            if (sortOption === "za") return b.username.localeCompare(a.username);
            if (sortOption === "recent") return b.id_user - a.id_user;
            if (sortOption === "oldest") return a.id_user - b.id_user;
            return 0;
        });

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-col flex-1 ml-64">
                <Topbar />
                <main className="p-6 flex-1 overflow-auto">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                            <h1 className="text-2xl font-semibold text-slate-800">User Management</h1>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 text-slate-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search user..."
                                            className="border border-slate-300 text-sm pl-8 pr-3 py-1.5 rounded-md focus:ring-2 focus:ring-blue-400 outline-none w-52 md:w-64"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className="relative">
                                        <Filter className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                        <select
                                            className="pl-9 pr-8 py-2 border border-gray-300 rounded-md text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-400 outline-none appearance-none"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.startsWith("role:")) {
                                                    setRoleFilter(value.replace("role:", ""));
                                                    setStatusFilter("");
                                                } else if (value.startsWith("status:")) {
                                                    setStatusFilter(value.replace("status:", ""));
                                                    setRoleFilter("");
                                                } else if (value.startsWith("sort:")) {
                                                    setSortOption(value.replace("sort:", ""));
                                                } else {
                                                    setRoleFilter("");
                                                    setStatusFilter("");
                                                    setSortOption("");
                                                }
                                            }}
                                        >
                                            <option value="">All</option>
                                            <optgroup label="Filter Role">
                                                <option value="role:admin">Admin</option>
                                                <option value="role:editor">Editor</option>
                                                <option value="role:viewer">Viewer</option>
                                                <option value="role:seo">SEO Specialist</option>
                                            </optgroup>
                                            <optgroup label="Filter Status">
                                                <option value="status:active">Aktif</option>
                                                <option value="status:inactive">Nonaktif</option>
                                            </optgroup>
                                            <optgroup label="Filter Abjad">
                                                <option value="sort:az">Nama (A–Z)</option>
                                                <option value="sort:za">Nama (Z–A)</option>
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

                                <Button
                                    onClick={() => openFormModal()}
                                    className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2 flex items-center gap-2"
                                >
                                    <UserPlus size={16} />
                                    <span>Add User</span>
                                </Button>
                            </div>
                        </div>

                        {loading ? (
                            <p className="text-center text-slate-500 py-6">Loading data...</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border border-slate-200 rounded-lg text-sm text-center table-auto">
                                    <thead className="bg-slate-100 text-slate-700">
                                        <tr>
                                            <th className="py-3 px-4 border-b w-[5%]">No</th>
                                            <th className="py-3 px-4 border-b w-[15%]">Username</th>
                                            <th className="py-3 px-4 border-b w-[25%]">Email</th>
                                            <th className="py-3 px-4 border-b w-[15%]">Role</th>
                                            <th className="py-3 px-4 border-b w-[15%]">Status</th>
                                            <th className="py-3 px-4 border-b w-[25%]">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user, index) => {
                                                const isActive = Number(user.is_active) === 1;
                                                return (
                                                    <tr key={user.id_user ?? user.id ?? index} className="hover:bg-slate-50">
                                                        <td className="py-3 px-4 border-b">{index + 1}</td>
                                                        <td className="py-3 px-4 border-b">{user.username || user.nama_user}</td>
                                                        <td className="py-3 px-4 border-b">{user.email}</td>
                                                        <td className="py-3 px-4 border-b capitalize">{user.role}</td>
                                                        <td className="py-3 px-4 border-b">
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-xs font-medium ${isActive
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-yellow-100 text-yellow-800"
                                                                    }`}
                                                            >
                                                                {isActive ? "Active" : "Inactive"}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 border-b space-x-2">
                                                            <button
                                                                onClick={() => openFormModal(user)}
                                                                className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition"
                                                                title="Edit User"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleActive(user)}
                                                                className={`p-2 rounded-lg text-white transition ${isActive
                                                                    ? "bg-yellow-500 hover:bg-yellow-600"
                                                                    : "bg-green-500 hover:bg-green-600"
                                                                    }`}
                                                                title={isActive ? "Nonaktifkan Akun" : "Aktifkan Akun"}
                                                            >
                                                                {isActive ? <PowerOff size={16} /> : <Power size={16} />}
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteModal(user)}
                                                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
                                                                title="Hapus User"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="text-center py-4 text-slate-500">
                                                    Tidak ada data pengguna
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <Toaster position="top-right" reverseOrder={false} />

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
                        <h2 className="text-lg font-semibold mb-2 text-gray-800">Hapus Akun?</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Apakah kamu yakin ingin menghapus{" "}
                            <span className="font-semibold">
                                {userToDelete?.username || userToDelete?.nama_user}
                            </span>{" "}
                            ({userToDelete?.email}) dari sistem?
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={closeDeleteModal}
                                className="flex items-center gap-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                            >
                                <X size={16} /> Batal
                            </button>
                            <button
                                onClick={() => handleDelete(userToDelete)}
                                disabled={deleting}
                                className={`flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded-lg transition ${deleting ? "opacity-70 cursor-not-allowed" : "hover:bg-red-600"}`}
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} /> Menghapus...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} /> Hapus
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Form Modal */}
            {showFormModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-96">
                        <h2 className="text-lg font-semibold mb-4">
                            {isEditing ? "Edit User" : "Tambah User"}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid gap-4">
                            <input
                                type="text"
                                placeholder="Username"
                                className="border p-2 rounded-lg"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                className="border p-2 rounded-lg"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                            <select
                                className="border p-2 rounded-lg"
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                            >
                                <option value="admin">Admin</option>
                                <option value="editor">Editor</option>
                                <option value="viewer">Viewer</option>
                                <option value="seo">SEO Specialist</option>
                            </select>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={
                                        isEditing
                                            ? "Kosongkan jika tidak ingin ganti password"
                                            : "Password"
                                    }
                                    className="border p-2 rounded-lg w-full pr-10"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required={!isEditing}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeFormModal}
                                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    {isEditing ? "Update" : "Tambah"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}