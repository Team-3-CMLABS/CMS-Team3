"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  FileText,
  Layers,
  FilePlus2,
  FilterIcon,
  Eye,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

export default function ContentPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeModal, setActiveModal] = useState<{
    type: "detail" | "edit" | "delete" | null;
    data: any | null;
  }>({ type: null, data: null });

  const router = useRouter();

  const handleAddContent = () => router.push("/content-builder");

  const contents = [
    {
      title: "Homepage Banner",
      desc: "Hero section with call-to-action button.",
      status: "Published",
      icon: <FileText className="text-blue-500" size={26} />,
    },
    {
      title: "About Us Section",
      desc: "Company mission statement.",
      status: "Draft",
      icon: <Layers className="text-indigo-500" size={26} />,
    },
    {
      title: "Contact Page",
      desc: "Form and map integration.",
      status: "Published",
      icon: <FilterIcon className="text-teal-500" size={26} />,
    },
  ];

  const filteredContents = contents.filter(
    (c) =>
      (filter === "All" || c.status === filter) &&
      c.title.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (type: "detail" | "edit" | "delete", data: any) => {
    setActiveModal({ type, data });
  };

  const closeModal = () => setActiveModal({ type: null, data: null });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-col flex-1 ml-64">
        <Topbar />

        <main className="flex-1 overflow-auto p-6">
          {/* Main Card Wrapper */} 
          <div className="bg-white p-6 rounded-xl shadow-sm">
            {/* ======= HEADER + SEARCH & FILTER ======= */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
              {/* Kiri: Judul & Deskripsi */}
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  Content Management
                </h1>
                <p className="text-gray-500 mt-1">
                  Manage and organize your website content efficiently.
                </p>
              </div>

              {/* Kanan: Search, Filter, Add Button */}
              <div className="flex flex-wrap items-center justify-end gap-3">
                {/* Search */}
                <div className="relative">
                  <Search
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-50 pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
                  />
                </div>

                {/* Filter */}
                <div className="relative"> 
                  <Filter
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={16}
                  />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-400 outline-none appearance-none"
                  >
                    <option>All</option>
                    <option>Published</option>
                    <option>Draft</option>
                  </select>
                  {/* Icon dropdown (panah bawah) */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Add Button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={handleAddContent}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2 flex items-center gap-2"
                >
                  <FilePlus2 size={18} />
                  Add Content
                </motion.button>
              </div>
            </div>

            {/* ======= CONTENT GRID ======= */}
            {filteredContents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContents.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="group bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gray-50">
                          {item.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 leading-tight group-hover:text-blue-700 transition">
                          {item.title}
                        </h3>
                      </div>
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${item.status === "Published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                      {item.desc}
                    </p>

                    {/* CRUD Buttons */}
                    <div className="flex items-center justify-end gap-4 mt-3 pt-3 border-t border-gray-100">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal("detail", item)}
                        className="flex items-center gap-1.5 text-gray-600 text-sm font-medium hover:text-gray-800 transition"
                      >
                        <Eye size={16} />
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal("edit", item)}
                        className="flex items-center gap-1.5 text-blue-600 text-sm font-medium hover:text-blue-700 transition"
                      >
                        <Pencil size={16} />
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal("delete", item)}
                        className="flex items-center gap-1.5 text-red-600 text-sm font-medium hover:text-red-700 transition"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
                <FileText size={48} className="mb-4 text-gray-400" />
                <p className="text-lg mb-3">No content found</p>
                <button
                  onClick={handleAddContent}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <FilePlus2 size={16} /> Add New Content
                </button>
              </div>
            )}
          </div>

          {/* ======= MODAL ======= */}
          <AnimatePresence>
            {activeModal.type && (
              // Modal code remains the same...
              <motion.div
                key="modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", duration: 0.4 }}
                  className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md relative"
                >
                  <button
                    onClick={closeModal}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>

                  {/* DETAIL */}
                  {activeModal.type === "detail" && (
                    <>
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Content Details
                      </h2>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Title:</strong> {activeModal.data.title}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Status:</strong> {activeModal.data.status}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Description:</strong> {activeModal.data.desc}
                      </p>
                    </>
                  )}

                  {/* EDIT */}
                  {activeModal.type === "edit" && (
                    <>
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Edit Content
                      </h2>
                      <input
                        defaultValue={activeModal.data.title}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm mb-3"
                      />
                      <textarea
                        defaultValue={activeModal.data.desc}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm mb-4"
                        rows={3}
                      />
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition w-full">
                        Save Changes
                      </button>
                    </>
                  )}

                  {/* DELETE */}
                  {activeModal.type === "delete" && (
                    <>
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Confirm Delete
                      </h2>
                      <p className="text-sm text-gray-600 mb-6">
                        Are you sure you want to delete{" "}
                        <strong>{activeModal.data.title}</strong>? This action
                        cannot be undone.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={closeModal}
                          className="flex-1 border border-gray-300 text-gray-700 rounded-md py-2 hover:bg-gray-100 transition text-sm"
                        >
                          Cancel
                        </button>
                        <button className="flex-1 bg-red-600 text-white rounded-md py-2 hover:bg-red-700 transition text-sm">
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}