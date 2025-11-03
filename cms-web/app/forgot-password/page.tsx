"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import logo from "@/public/logo.png";
import illustration from "@/public/illustration.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/password/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      router.push(`/check-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(data.token)}`);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan, coba lagi");
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white dark:bg-slate-900 px-8 relative">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">
            Forgot Password
          </h2>
          <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-8">
            No worries! Enter your email address below, and we’ll send you a link
            to reset your password.
          </p>

          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#3A7AC3]">
                <FiMail className="text-slate-400 mr-2" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full outline-none bg-transparent text-sm"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#3A7AC3] text-white font-semibold py-2 rounded-lg hover:bg-[#336aa9] transition"
            >
              Reset password
            </button>
          </form>

          <div className="mt-6 flex justify-center items-center text-sm">
            <FiArrowLeft className="mr-2 text-slate-500 dark:text-slate-400" />
            <Link
              href="/login"
              className="text-slate-600 dark:text-slate-300 hover:underline"
            >
              Back to log in
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-slate-100 dark:bg-slate-800">
        <Image
          src={illustration}
          alt="Forgot illustration"
          className="max-w-md"
        />
      </div>

      {/* Small logo + CMS Name */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <span className="hidden sm:inline text-sm font-semibold text-slate-700 dark:text-slate-200">
          CMS Name
        </span>
        <Image src={logo} alt="Logo" className="w-10 h-10" />
      </div>
    </div>
  );
}

