"use client";

import "./globals.css";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const publicRoutes = [
      "/",
      "/landing",
      "/login",
      "/signup",
      "/forgot-password",
      "/check-email",
      "/google-callback",
      "/reset-password",
      "/link-expired",
      "/password-reset-success",
    ];

    if (!publicRoutes.some((r) => pathname.startsWith(r))) {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      }
    }
  }, [pathname, router]);

  return (
    <html lang="en">
      <body className="bg-slate-50">
        {children}
      </body>
    </html>
  );
}
