"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

import logo from "@/public/logo.png";
import illustration from "@/public/illustration.png";
import Swal from "sweetalert2";
import ThemeToggle from "@/components/ThemeToggle";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [popup, setPopup] = useState(false);

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      Swal.fire({
        icon: "warning",
        title: "Terms & Conditions",
        text: "Please accept the Terms & Conditions before continuing.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_user: nama, email, username, password }),
      });
      const data = await res.json();
      console.log("📡 Response backend:", data);

      if (res.ok) {
        setPopup(true); // show popup
      } else {
        alert(data.message || "Gagal membuat akun");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Tidak bisa konek ke server");
    }
  };

  const handleClosePopup = () => {
    setPopup(false);
    router.push("/login"); // redirect ke halaman login
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Left side - Illustration */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-slate-100 dark:bg-slate-800">
        <Image src={illustration} alt="Signup illustration" className="max-w-md" />
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white dark:bg-slate-900 px-8 py-5 md:py-9">
        <div className="w-full max-w-md">
          {/* Title */}
          <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">
            Sign Up
          </h2>
          <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-8">
            Create your account to get started
          </p>

          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#3A7AC3]">
                <FiUser className="text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="Your full name"
                  className="w-full outline-none bg-transparent text-sm"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#3A7AC3]">
                <FiMail className="text-slate-400 mr-2" />
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  className="w-full outline-none bg-transparent text-sm"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Username
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#3A7AC3]">
                <FiUser className="text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="Your username"
                  className="w-full outline-none bg-transparent text-sm"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#3A7AC3]">
                <FiLock className="text-slate-400 mr-2" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full outline-none bg-transparent text-sm"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-slate-500"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="accent-[#3A7AC3] w-4 h-4"
              />
              <span className="text-slate-600 dark:text-slate-300">
                I agree to CMS{" "}
                <Link href="/terms" className="text-[#3A7AC3] hover:underline">
                  Terms of service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#3A7AC3] hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </div>

            {/* Sign Up button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#3A7AC3] text-white font-semibold py-2 rounded-lg transition ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#336aa9]"
                }`}
            >
              {loading ? "Processing..." : "Sign Up"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="px-3 text-sm text-slate-500">or</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>

          {/* Google */}
          <button
            onClick={() => (window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`)}
            disabled={loading}
            className="w-full border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <Image src="/google.png" alt="google" width={20} height={20} />
            Continue with Google
          </button>

          {/* Already have account */}
          <p className="text-sm text-center mt-6 text-slate-600 dark:text-slate-300">
            Already have an account?{" "}
            <Link href="/login" className="text-[#3A7AC3] font-medium hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>

      {/* Small logo + CMS Name */}
      <div className="absolute top-4 left-4 flex items-center gap-3">
        <Image src={logo} alt="Logo" width={40} height={40} />
        <span className="hidden sm:inline text-sm font-semibold text-slate-700 dark:text-slate-200">
          CMS Team 3
        </span>
      </div>

      {/* ================= Popup Success ================= */}
      {popup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg w-80 text-center transform transition-transform duration-300 scale-95 animate-scaleIn">
            <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-100">
              Signup Successful!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Your account has been created. Please wait for admin approval.
            </p>
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
