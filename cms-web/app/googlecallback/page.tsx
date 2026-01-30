"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function GoogleCallback() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userParam = params.get("user");
    const status = params.get("status");

    // 🚫 Akun masih menunggu persetujuan admin
    if (status === "pending") {
      Swal.fire({
        icon: "info",
        title: "Menunggu Persetujuan Admin",
        text: "Akun Anda sedang menunggu persetujuan dari admin sebelum bisa login.",
        toast: true,
        position: "top-end",
        timer: 4000,
        showConfirmButton: false,
      }).then(() => {
        router.push("/login");
      });
      return;
    }

    // 🚫 Akun dinonaktifkan
    if (status === "inactive") {
      Swal.fire({
        icon: "error",
        title: "Akun Dinonaktifkan",
        text: "Akun Anda telah dinonaktifkan oleh admin. Silakan hubungi admin untuk informasi lebih lanjut.",
        toast: true,
        position: "top-end",
        timer: 4000,
        showConfirmButton: false,
      }).then(() => {
        router.push("/login");
      });
      return;
    }

    // ✅ Jika login berhasil
    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam)); // decode JSON user
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        router.push("/dashboard");
      } catch (err) {
        console.error("Gagal parse data user:", err);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  return <p className="text-center mt-10">Memproses login Google...</p>;
}
