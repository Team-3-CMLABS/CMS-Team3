"use client";

import Image from "next/image";
import { FiBell } from "react-icons/fi";
import {
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Package,
  LogOut,
  User,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import PlanBuildingModal from "@/components/PlanBuildingModal";
import { Button } from "@/components/ui/button";

interface User {
  full_name: string;
  username: string;
  photo?: string;
  role: string;
}

interface Notification {
  id: number | string;
  message: string;
  read_status: boolean;
  created_at: string;
}

export default function Topbar() {
  const [user, setUser] = useState<User | null>(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const userRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const getPageTitle = () => {
    if (!pathname) return "Dashboard";

    // Ambil bagian path setelah tanda '/'
    const parts = pathname
      .split("/")
      .filter((p) => p && p.trim() !== "") // hapus kosong
      .map((p) =>
        p
          .replace(/-/g, " ") // ganti "-" dengan spasi
          .replace(/\b\w/g, (c) => c.toUpperCase()) // kapital tiap kata
      );

    // Gabungkan jadi breadcrumb style
    return parts.join(" / ") || "Dashboard";
  };

  // ===== Ambil profil user dari API =====
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Gagal ambil data profil:", await res.text());
          return;
        }

        const data = await res.json();
        if (data.profile) {
          setUser({
            full_name: data.profile.full_name,
            username: data.profile.username,
            photo: data.profile.photo,
            role: data.profile.role,
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  // Tutup kalau klik di luar dua area ini
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        notifRef.current &&
        !notifRef.current.contains(target) &&
        userRef.current &&
        !userRef.current.contains(target)
      ) {
        setShowNotifMenu(false);
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ===== Ambil notifikasi =====
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`);
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Gagal ambil notifikasi:", err);
      }
    };
    fetchNotifications();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handlePlanClick = async () => {
    try {
      setOpenMenu(false);

      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("❌ User ID tidak ditemukan di localStorage");
        return;
      }

      // 🔍 Cek apakah user punya data payment
      const paymentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/check/${userId}`);
      const paymentData = await paymentRes.json();

      // Jika user belum pernah melakukan payment → tampilkan modal plan building
      if (!Array.isArray(paymentData) || paymentData.length === 0) {
        console.log("🆕 Belum ada data payment → buka modal plan building");
        setTimeout(() => setShowModal(true), 150);
        return;
      }

      // 🔍 Jika sudah ada payment, lanjut cek subscription
      const subRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/check/${userId}`);
      const subData = await subRes.json();

      // Jika sudah punya subscription → langsung ke halaman plan-billing
      if (Array.isArray(subData) && subData.length > 0) {
        const sub = subData[0];
        if (sub.id && sub.planId) {
          console.log("✅ User sudah punya subscription → redirect ke /plan-billing");
          router.push("/plan-billing");
          return;
        }
      }

      // Jika belum punya subscription
      console.log("🆕 Belum ada subscription → buka modal PlanBuilding");
      setTimeout(() => setShowModal(true), 150);

    } catch (err) {
      console.error("❌ Error handlePlanClick:", err);
      // Fallback buka modal jika error
      setTimeout(() => setShowModal(true), 150);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-white border-b border-slate-200 px-5 py-2">
      {/* ====== Breadcrumb Title ====== */}
      <h1 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
        {(() => {
          const title = getPageTitle();
          const parts = title.split(" / ");

          return parts.map((part, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-slate-400">/</span>}
              <span
                onClick={() => {
                  if (i < parts.length - 1) {
                    const targetPath =
                      "/" +
                      parts
                        .slice(0, i + 1)
                        .join("/")
                        .toLowerCase()
                        .replace(/\s+/g, "-");
                    router.push(targetPath);
                  }
                }}
                className={`${i < parts.length - 1
                  ? "text-slate-800 hover:text-blue-600 cursor-pointer transition-colors duration-200"
                  : "text-slate-700 font-medium"
                  }`}
              >
                {part}
              </span>
            </span>
          ));
        })()}
      </h1>

      {/* ====== Right Section ====== */}
      <div className="flex items-center gap-5">
        {/* ===== Notifikasi ===== */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setOpenMenu(false);
              console.log("User clicked notification bell");
            }}
            className="relative p-2 rounded-full hover:bg-slate-100 transition"
          >
            <FiBell className="w-5 h-5 text-slate-700" />
            {notifications.some((n) => !n.read_status) && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-md">
                {notifications.filter((n) => !n.read_status).length}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto animate-fade-in"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 border-b border-slate-200 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <FiBell className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-indigo-700">Notifikasi</h3>
                </div>
                <button
                  onClick={async () => {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, { method: "DELETE" });
                    setNotifications([]);
                  }}
                  className="text-xs text-slate-500 hover:text-red-600 font-medium transition"
                >
                  Hapus Semua
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  <p>Tidak ada notifikasi</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  let bgColor = notif.read_status
                    ? "bg-white hover:bg-slate-50"
                    : "bg-purple-50 hover:bg-purple-100";
                  let icon = <Info className="w-4 h-4 text-purple-600" />;

                  if (notif.message.toLowerCase().includes("berhasil")) {
                    bgColor = notif.read_status
                      ? "bg-white hover:bg-slate-50"
                      : "bg-green-50 hover:bg-green-100";
                    icon = <CheckCircle className="w-4 h-4 text-green-600" />;
                  } else if (notif.message.toLowerCase().includes("gagal")) {
                    bgColor = notif.read_status
                      ? "bg-white hover:bg-slate-50"
                      : "bg-red-50 hover:bg-red-100";
                    icon = <AlertTriangle className="w-4 h-4 text-red-600" />;
                  } else if (
                    notif.message.toLowerCase().includes("warning") ||
                    notif.message.toLowerCase().includes("peringatan")
                  ) {
                    bgColor = notif.read_status
                      ? "bg-white hover:bg-slate-50"
                      : "bg-yellow-50 hover:bg-yellow-100";
                    icon = <AlertCircle className="w-4 h-4 text-yellow-600" />;
                  }

                  return (
                    <div
                      key={notif.id}
                      className={`group flex items-center justify-between p-3 border-b last:border-none transition-all duration-200 ${bgColor}`}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-0.5">{icon}</div>
                        <div>
                          <p
                            className={`text-sm ${notif.read_status
                              ? "text-slate-600"
                              : "font-semibold text-slate-800"
                              }`}
                          >
                            {notif.message}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {new Date(notif.created_at).toLocaleString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "short",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-3">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const newStatus = !notif.read_status;
                            await fetch(
                              `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notif.id}/${newStatus ? "read" : "unread"}`,
                              { method: "PUT" }
                            );
                            setNotifications((prev) =>
                              prev.map((n) =>
                                n.id === notif.id ? { ...n, read_status: newStatus } : n
                              )
                            );
                          }}
                          className={`p-1 rounded-full transition ${notif.read_status
                            ? "text-slate-400 hover:text-blue-500 hover:bg-blue-50"
                            : "text-blue-600 hover:text-slate-500 hover:bg-slate-100"
                            }`}
                          title={
                            notif.read_status
                              ? "Tandai belum dibaca"
                              : "Tandai sudah dibaca"
                          }
                        >
                          {notif.read_status ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await fetch(
                              `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notif.id}`,
                              { method: "DELETE" }
                            );
                            setNotifications((prev) =>
                              prev.filter((n) => n.id !== notif.id)
                            );
                          }}
                          title="Hapus"
                          className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-300"></div>

        {/* ===== User Menu ===== */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => {
              setOpenMenu(!openMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 px-3 py-1.5 rounded-xl transition"
          >
            <Image
              src={
                user?.photo
                  ? `${process.env.NEXT_PUBLIC_API_URL}${user.photo}`
                  : "/react.png"
              }
              alt="User Avatar"
              width={38}
              height={38}
              className="rounded-full border-2 border-blue-200 shadow-md object-cover aspect-square"
            />
            <div className="text-left">
              <p className="text-xs text-slate-500">Welcome back</p>
              <p className="font-semibold text-slate-800">
                {user?.full_name || user?.username || "User"}
              </p>
            </div>
          </button>

          {openMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-50 border border-slate-300 rounded-lg shadow-md p-3 z-50">
              <button
                onClick={() => router.push("/profile")}
                className="w-full flex items-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-3 py-2 rounded-lg transition-all duration-200"
              >
                <User size={16} />
                Profile
              </button>

              <button
                onClick={handlePlanClick}
                className="w-full flex items-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-3 py-2 rounded-lg transition-all duration-200"
              >
                <Package size={16} />
                Plan & Billing
              </button>

              <button
                onClick={() => {
                  setOpenMenu(false);
                  setShowLogoutPopup(true);
                }}
                className="w-full flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 px-3 py-2 rounded-lg transition-all duration-200"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== Modal dan Popup ===== */}
      <PlanBuildingModal show={showModal} onClose={() => setShowModal(false)} />

      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Konfirmasi Logout
            </h2>
            <p className="text-sm text-slate-600 mb-5">
              Apakah kamu yakin ingin logout?
            </p>
            <div className="flex justify-center gap-3">
              <Button
                className="bg-gray-200 text-slate-700 hover:bg-gray-300"
                onClick={() => setShowLogoutPopup(false)}
              >
                Batal
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleLogout}
              >
                Ya, Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
