"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  FiHome,
  FiFolder,
  FiFileText,
  FiEdit,
  FiImage,
  FiSearch,
  FiUsers,
  FiUserCheck,
  FiLock,
  FiSettings,
  FiChevronDown,
  FiChevronUp,
  FiLayers,
  FiGrid,
} from "react-icons/fi";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string>("");
  const [builderOpen, setBuilderOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (user) {
        const parsed = JSON.parse(user);
        setRole(parsed.role);
      }
    }

    if (pathname.startsWith("/content-builder")) {
      setBuilderOpen(true);
    } else {
      setBuilderOpen(false);
    }
  }, [pathname]);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/")
      ? "bg-blue-100/30 text-blue-600 font-semibold"
      : "text-slate-600 hover:bg-slate-50";

  return (
    <aside
      className={clsx(
        "fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 w-64 z-40"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-100">
        <Image src="/logo.png" alt="Logo" width={36} height={36} />
        <h1 className="font-semibold text-slate-800 text-lg">CMS Team 3</h1>
      </div>

      {/* Menu utama */}
      <nav className="flex-1 py-6 space-y-1 text-sm px-4 overflow-y-auto">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={clsx(
            "flex items-center gap-3 px-3 py-2 rounded-lg w-full justify-start",
            isActive("/dashboard")
          )}
        >
          <FiHome className="w-5 h-5" />
          Dashboard
        </Link>

        {/* Projects */}
        <Link
          href="/projects"
          className={clsx(
            "flex items-center gap-3 px-3 py-2 rounded-lg w-full justify-start",
            isActive("/projects")
          )}
        >
          <FiFolder className="w-5 h-5" />
          Projects
        </Link>

        {/* Content */}
        <Link
          href="/content"
          className={clsx(
            "flex items-center gap-3 px-3 py-2 rounded-lg w-full justify-start",
            isActive("/content")
          )}
        >
          <FiFileText className="w-5 h-5" />
          Content
        </Link>

        {/* Content Builder (dropdown) */}
        {(role === "admin" || role === "editor") && (
          <div>
            <button
              onClick={() => setBuilderOpen(!builderOpen)}
              className={clsx(
                "flex items-center justify-between gap-3 px-3 py-2 rounded-lg w-full transition-all duration-200",
                pathname.startsWith("/content-builder")
                  ? "bg-blue-100/30 text-blue-600 font-semibold"
                  : "text-slate-600 hover:bg-gray-50 hover:text-slate-600"
              )}
            >
              <span className="flex items-center gap-3">
                <FiEdit className="w-5 h-5" />
                Content Builder
              </span>
              {builderOpen ? (
                <FiChevronUp className="w-4 h-4" />
              ) : (
                <FiChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Dropdown submenu */}
            {builderOpen && (
              <div className="ml-8 mt-1 space-y-1 transition-all duration-300">
                <Link
                  href="/content-builder/single-page"
                  className={clsx(
                    "flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-all duration-200",
                    pathname === "/content-builder/single-page" ||
                      pathname.startsWith("/content-builder/single-page/")
                      ? "bg-blue-100/30 text-blue-600 font-semibold"
                      : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                  )}
                >
                  <FiFileText className="w-4 h-4" />
                  Single Page
                </Link>

                <Link
                  href="/content-builder/multi-page"
                  className={clsx(
                    "flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-all duration-200",
                    pathname === "/content-builder/multi-page" ||
                      pathname.startsWith("/content-builder/multi-page/")
                      ? "bg-blue-100/30 text-blue-600 font-semibold"
                      : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                  )}
                >
                  <FiLayers className="w-4 h-4" />
                  Multi Page
                </Link>

                <Link
                  href="/content-builder/component"
                  className={clsx(
                    "flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-all duration-200",
                    pathname === "/content-builder/component" ||
                      pathname.startsWith("/content-builder/component/")
                      ? "bg-blue-100/30 text-blue-600 font-semibold"
                      : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                  )}
                >
                  <FiGrid className="w-4 h-4" />
                  Component
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Media Library */}
        {(role === "admin" || role === "editor") && (
          <Link
            href="/media-library"
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg w-full justify-start",
              isActive("/media-library")
            )}
          >
            <FiImage className="w-5 h-5" />
            Media Library
          </Link>
        )}

        {/* SEO Dashboard */}
        {(role === "admin" || role === "seo") && (
          <Link
            href="/seo-dashboard"
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg w-full justify-start",
              isActive("/seo-dashboard")
            )}
          >
            <FiSearch className="w-5 h-5" />
            SEO Dashboard
          </Link>
        )}

        {/* Admin-only section */}
        {role === "admin" && (
          <>
            <hr className="my-4 border-slate-200" />

            <Link
              href="/collaborators"
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg w-full justify-start",
                isActive("/collaborators")
              )}
            >
              <FiUsers className="w-5 h-5" />
              Collaborators
            </Link>

            <Link
              href="/user-management"
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg w-full justify-start",
                isActive("/user-management")
              )}
            >
              <FiUserCheck className="w-5 h-5" />
              User Management
            </Link>

            <Link
              href="/roles-permissions"
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg w-full justify-start",
                isActive("/roles-permissions")
              )}
            >
              <FiLock className="w-5 h-5" />
              Roles & Permissions
            </Link>

            <hr className="my-4 border-slate-200" />
          </>
        )}

        {/* Settings */}
        <Link
          href="/settings"
          className={clsx(
            "flex items-center gap-3 px-3 py-2 rounded-lg w-full justify-start",
            isActive("/settings")
          )}
        >
          <FiSettings className="w-5 h-5" />
          Settings
        </Link>
      </nav>
    </aside>
  );
}
