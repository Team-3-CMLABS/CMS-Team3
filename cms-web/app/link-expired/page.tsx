"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.png";
import illustration from "@/public/illustration.png";

export default function LinkExpired() {
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
            Link Expired
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
            The password reset link has expired. <br />
            Please request a new link to reset your password.
          </p>

          {/* Back button */}
          <Link
            href="/login"
            className="block w-full bg-slate-600 text-white font-semibold py-2 rounded-lg hover:bg-slate-700 transition"
          >
            Back to login
          </Link>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-slate-100 dark:bg-slate-800">
        <Image src={illustration} alt="illustration" className="max-w-md" />
      </div>
    </div>
  );
}
