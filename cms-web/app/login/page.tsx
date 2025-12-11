"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import ThemeToggle from "@/components/ThemeToggle";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Popup state
  const [popup, setPopup] = useState<{
    show: boolean;
    title: string;
    message: string;
    success?: boolean;
  }>({ show: false, title: "", message: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPopup({
          show: true,
          title: "Login Failed",
          message: data.message || "Periksa kembali username/password",
          success: false,
        });
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.id_user || data.user.id || data.user.userId);

      if (data.user.status !== "ACTIVE") {
        setPopup({
          show: true,
          title: "Pending Approval",
          message: "Akun Anda belum di-approve oleh admin.",
          success: false,
        });
        return;
      }

      // Redirect sesuai role
      let redirectPath = "/dashboard";
      let roleMsg = "";

      switch (data.user.role) {
        case "admin":
          roleMsg = "Admin";
          redirectPath = "/dashboard";
          break;
        case "editor":
          roleMsg = "Editor";
          redirectPath = "/dashboard";
          break;
        case "viewer":
          roleMsg = "Viewer";
          redirectPath = "/dashboard";
          break;
        case "seo":
          roleMsg = "SEO Specialist";
          redirectPath = "/dashboard";
          break;
        default:
          roleMsg = "User";
          redirectPath = "/";
          break;
      }

      setPopup({
        show: true,
        title: "Login Successful",
        message: `Login sebagai ${roleMsg} berhasil!`,
        success: true,
      });

      // redirect setelah beberapa detik
      setTimeout(() => router.push(redirectPath), 1500);
    } catch (err) {
      console.error("Login error:", err);
      setPopup({
        show: true,
        title: "Login Error",
        message: "Tidak bisa konek ke server",
        success: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClosePopup = () => {
    setPopup({ show: false, title: "", message: "" });
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white dark:bg-slate-900 px-8 relative">
        <div className="w-full max-w-md">

          {/* Title */}
          <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">
            Login
          </h2>
          <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-8">
            Enter your email and password to access your account
          </p>

          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Email / Username
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#3A7AC3]">
                <FiMail className="text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="example@gmail.com / username"
                  className="w-full outline-none bg-transparent text-sm dark:text-white"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Enter your password
              </label>

              <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#3A7AC3]">
                <FiLock className="text-slate-400 mr-2" />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full outline-none bg-transparent text-sm dark:text-white"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  aria-label="Password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="ml-2 p-1 rounded text-slate-500 hover:text-slate-700 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={0}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <input type="checkbox" className="accent-[#3A7AC3]" />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-[#3A7AC3] hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#3A7AC3] text-white font-semibold py-2 rounded-lg transition ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#336aa9]"
                }`}
            >
              {loading ? "Processing..." : "Login"}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="px-3 text-sm text-slate-500">or</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>

          <button
            onClick={() => (window.location.href = "http://localhost:4000/api/auth/google")}
            disabled={loading}
            className="w-full border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <Image src="/google.png" alt="google" width={20} height={20} />
            Continue with Google
          </button>

          <p className="text-sm text-center mt-6 text-slate-600 dark:text-slate-300">
            Haven't joined yet?{" "}
            <Link href="/signup" className="text-[#3A7AC3] font-medium hover:underline">
              Sign up today
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-slate-100 dark:bg-slate-800">
        <Image src="/illustration.png" alt="Login illustration" width={400} height={400} />
      </div>

      {/* Top-right logo */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <span className="hidden sm:inline text-sm font-semibold text-slate-700 dark:text-slate-200">
          CMS Team 3
        </span>
        <Image src="/logo.png" alt="Logo" width={40} height={40} />
      </div>

      {/* ================= Popup ================= */}
      {popup.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg w-80 text-center">
            <h3
              className={`text-lg font-semibold mb-2 ${popup.success ? "text-green-600" : "text-red-600"
                }`}
            >
              {popup.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{popup.message}</p>
            <button
              onClick={handleClosePopup}
              className="bg-[#3A7AC3] text-white py-2 px-4 rounded hover:bg-[#336aa9] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
