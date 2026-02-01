"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Swal from "sweetalert2";
import { ShieldCheck, Loader2 } from "lucide-react";

interface PendingUser {
  id_user: number;
  nama_user: string;
  username: string;
  email: string;
  role?: string;
  status: string;
}

export default function RolesPermissionsPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<number | null>(null); // untuk spinner di baris tertentu

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Ambil data user pending
  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: PendingUser[] = await res.json();
      const pending = data.filter(u => u.status === "PENDING_ROLE" || !u.role);
      setUsers(pending);
    } catch (err) {
      console.error("Gagal mengambil user pending:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  // ===================== APPROVE USER =====================
  const handleApprove = async (user: PendingUser) => {
    if (!user.role) {
      Swal.fire({
        icon: "warning",
        title: "Role belum dipilih!",
        text: "Silakan pilih role sebelum approve user ini.",
      });
      return;
    }

    // Popup konfirmasi
    const confirm = await Swal.fire({
      title: "Yakin Approve Akun Ini?",
      text: `User: ${user.nama_user} (${user.email}) akan diaktifkan dengan role "${user.role}".`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Approve!",
      cancelButtonText: "Batal",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
    });

    if (!confirm.isConfirmed) return;

    // Set loading spinner khusus user ini
    setApproving(user.id_user);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${user.id_user}/approve`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: user.role }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Gagal Approve",
          text: data.error || "Terjadi kesalahan.",
        });
        return;
      }

      // Success popup 🎉
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: data.message || "User berhasil diaktifkan dan email terkirim.",
        timer: 2500,
        showConfirmButton: false,
      });

      // Hapus dari tabel
      setUsers((prev) => prev.filter((u) => u.id_user !== user.id_user));
    } catch (err) {
      console.error("Gagal approve user:", err);
      Swal.fire({
        icon: "error",
        title: "Kesalahan Server",
        text: "Gagal menghubungi server. Coba lagi nanti.",
      });
    } finally {
      setApproving(null);
    }
  };

  // ===================== RENDER =====================
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64">
        <Topbar />

        <main className="p-6 flex-1 overflow-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-800 mb-4 text-left">
              Roles & Permissions
            </h1>

            {loading ? (
              <p className="text-center text-slate-500">Loading data...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-slate-200 rounded-lg text-sm text-center">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="py-2 px-3 border-b">ID</th>
                      <th className="py-2 px-3 border-b">Nama</th>
                      <th className="py-2 px-3 border-b">Username</th>
                      <th className="py-2 px-3 border-b">Email</th>
                      <th className="py-2 px-3 border-b">Role</th>
                      <th className="py-2 px-3 border-b">Status</th>
                      <th className="py-2 px-3 border-b text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user.id_user} className="hover:bg-slate-50">
                          <td className="py-2 px-3 border-b">
                            {user.id_user}
                          </td>
                          <td className="py-2 px-3 border-b capitalize">
                            {user.nama_user}
                          </td>
                          <td className="py-2 px-3 border-b">
                            {user.username}
                          </td>
                          <td className="py-2 px-3 border-b">
                            {user.email}
                          </td>

                          {/* Role dropdown */}
                          <td className="py-2 px-3 border-b">
                            <select
                              value={user.role || ""}
                              onChange={(e) =>
                                setUsers((prev) =>
                                  prev.map((u) =>
                                    u.id_user === user.id_user
                                      ? { ...u, role: e.target.value }
                                      : u
                                  )
                                )
                              }
                              className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                            >
                              <option value="">Pilih Role</option>
                              <option value="admin">Admin</option>
                              <option value="editor">Editor</option>
                              <option value="seo">SEO Specialist</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          </td>

                          {/* Status */}
                          <td className="py-2 px-3 border-b text-yellow-600 font-medium">
                            {user.status}
                          </td>

                          {/* Action */}
                          <td className="py-2 px-3 border-b">
                            <button
                              onClick={() => handleApprove(user)}
                              disabled={approving === user.id_user}
                              className={`${approving === user.id_user
                                ? "bg-gray-400"
                                : "bg-green-500 hover:bg-green-600"
                                } text-white px-4 py-1.5 rounded-lg transition flex items-center gap-1 mx-auto`}
                            >
                              {approving === user.id_user ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <ShieldCheck size={16} />
                              )}
                              {approving === user.id_user
                                ? "Memproses..."
                                : "Approve"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-4 text-slate-500"
                        >
                          Tidak ada user menunggu approval
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
    </div>

  );
}
