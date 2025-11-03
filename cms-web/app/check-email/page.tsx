"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import logo from "@/public/logo.png";
import illustration from "@/public/illustration.png";

export default function CheckEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  return (
    <div className="min-h-screen flex">
      {/* Left side - Content */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white dark:bg-slate-900 px-8 relative">
        <div className="w-full max-w-md text-center">
          {/* Logo + CMS Name in top-right */}
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <span className="hidden sm:inline text-sm font-semibold text-slate-700 dark:text-slate-200">
              CMS Name
            </span>
            <Image src={logo} alt="Logo" className="w-10 h-10" />
          </div>

          {/* Avatar placeholder */}
          <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-6"></div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Check your email
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
            We sent a password reset link to your email{" "}
            <span className="font-semibold">{email}</span> <br />
            which is valid for 24 hours. Please check your inbox!
          </p>

          {/* Open Gmail button */}
          <a
            href="https://mail.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-[#3A7AC3] text-white font-semibold py-2 rounded-lg hover:bg-[#336aa9] transition mb-4"
          >
            Open Gmail
          </a>

          {/* Tombol dummy langsung ke Reset Password untuk testing */}
          {token && (
            <button
              onClick={() => router.push(`/reset-password/${token}`)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
            >
              Test Reset Password
            </button>
          )}

          {/* Resend link */}
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
            Don’t receive the email?{" "}
            <button className="text-[#3A7AC3] hover:underline">
              Click here to resend!
            </button>
          </p>

          {/* Back to login */}
          <div className="flex justify-center items-center text-sm">
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
        <Image src={illustration} alt="Illustration" className="max-w-md" />
      </div>
    </div>
  );
}

