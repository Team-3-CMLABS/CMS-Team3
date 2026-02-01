"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import logo from "@/public/logo.png";
import illustration from "@/public/illustration.png";
import ThemeToggle from "@/components/ThemeToggle";

export default function CheckEmailClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <div className="min-h-screen flex">
      {/* Left side */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white dark:bg-slate-900 px-8 relative">
        <div className="w-full max-w-md text-center">
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <span className="hidden sm:inline text-sm font-semibold text-slate-700 dark:text-slate-200">
              CMS Name
            </span>
            <Image src={logo} alt="Logo" className="w-10 h-10" />
          </div>

          <div className="absolute top-4 left-4">
            <ThemeToggle />
          </div>

          <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-6" />

          <h2 className="text-2xl font-bold mb-2">Check your email</h2>

          <p className="text-sm mb-6">
            We sent a password reset link to{" "}
            <span className="font-semibold">{email}</span>
          </p>

          <a
            href="https://mail.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-[#3A7AC3] text-white py-2 rounded-lg mb-4"
          >
            Open Gmail
          </a>

          <div className="flex justify-center items-center text-sm">
            <FiArrowLeft className="mr-2" />
            <Link href="/login">Back to log in</Link>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="hidden md:flex w-1/2 items-center justify-center">
        <Image src={illustration} alt="Illustration" className="max-w-md" />
      </div>
    </div>
  );
}
