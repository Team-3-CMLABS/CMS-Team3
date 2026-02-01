"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import Link from "next/link";
import logo from "@/public/logo.png";
import illustration from "@/public/illustration.png";
import ThemeToggle from "@/components/ThemeToggle";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/password/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        router.push("/link-expired");
        return;
      }

      router.push("/password-reset-success");
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan, coba lagi");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white dark:bg-slate-900 px-8 relative">
        <div className="w-full max-w-md">
          {/* Logo + CMS Name */}
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <span className="hidden sm:inline text-sm font-semibold text-slate-700 dark:text-slate-200">
              CMS Name
            </span>
            <Image src={logo} alt="Logo" width={40} height={40} />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">
            Set new password
          </h2>
          <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-8">
            Enter your new password below to complete the reset process. <br />
            Ensure it’s strong and secure.
          </p>

          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          {/* Form */}
          <form onSubmit={handleReset} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                New Password
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#3A7AC3]">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full outline-none bg-transparent text-sm"
                  minLength={4}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-slate-500"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Must be at least 4 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Enter your password again"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2 outline-none bg-transparent text-sm focus:ring-2 focus:ring-[#3A7AC3]"
              />
            </div>

            {/* Reset Button */}
            <button
              type="submit"
              className="w-full bg-[#3A7AC3] text-white font-semibold py-2 rounded-lg hover:bg-[#336aa9] transition"
            >
              Reset password
            </button>
          </form>

          {/* Back to login */}
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
        <Image src={illustration} alt="illustration" className="max-w-md" />
      </div>
    </div>
  );
}

