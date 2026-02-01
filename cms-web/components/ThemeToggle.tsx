"use client";

import { usePathname } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle({ size = 22 }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState("light");

  // halaman Auth
  const authRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/check-email",
    "/google-callback",
    "/reset-password",
    "/link-expired",
    "/password-reset-success",
  ];

  const isAuthPage = authRoutes.includes(pathname);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // ============ UI DI HALAMAN AUTH ============
  if (isAuthPage) {
    return (
      <button
        onClick={toggleTheme}
        className={`
          absolute top-2 right-4 z-[999]
          flex items-center gap-1 px-3 py-1.5 rounded-full border
          transition-all duration-200
          ${theme === "light" ? "translate-x-[-12px]" : "translate-x-[12px]"}
          bg-white/80 dark:bg-slate-800/80
          border-slate-300 dark:border-slate-600 
          shadow-md
        `}
      >
        {theme === "light" ? (
          <Sun size={18} className="text-yellow-500" />
        ) : (
          <Moon size={18} className="text-blue-400" />
        )}
        <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
          {theme === "light" ? "Light" : "Dark"}
        </span>
      </button>
    );
  }

  // ============ UI DI HALAMAN WEB APP ============
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
    >
      {theme === "light" ? (
        <Sun size={size} className="text-yellow-500" />
      ) : (
        <Moon size={size} className="text-blue-300" />
      )}
    </button>
  );
}
