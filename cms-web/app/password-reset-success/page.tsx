"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.png";
import illustration from "@/public/illustration.png";
import ThemeToggle from "@/components/ThemeToggle";

export default function PasswordResetSuccess() {
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
            <Image src={logo} alt="Logo" width={40} height={40} />
          </div>

          {/* Avatar placeholder */}
          <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-6" />

          {/* Title */}
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Your password has been successfully reset
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
            You can log in with your new password. <br />
            If you encounter any issues, please contact support!
          </p>

          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          {/* Login Now */}
          <Link
            href="/login"
            className="block w-full bg-slate-600 text-white font-semibold py-2 rounded-lg hover:bg-slate-700 transition mb-4 text-center"
          >
            Login Now
          </Link>

          {/* Back to login link */}
          <div className="text-sm">
            <Link
              href="/login"
              className="text-slate-600 dark:text-slate-300 hover:underline"
            >
              ← Back to log in
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-slate-100 dark:bg-slate-800">
        <Image
          src={illustration}
          alt="illustration"
          className="max-w-md"
          width={400}
          height={400}
        />
      </div>
    </div>
  );
}

