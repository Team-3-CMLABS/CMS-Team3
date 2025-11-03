"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiFolder } from "react-icons/fi";
import PageModal from "@/components/Modal";

export default function SinglePageBuilder() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);

  const openModal = (type: string) => {
    setModalType(type);
    setModalOpen(true);
  };

  // ✅ tutup modal
  const closeModal = () => {
    setModalType(null);
    setModalOpen(false);
  };

  // ✅ data kartu yang muncul di halaman
  const cards = [
    {
      title: "Single Page",
      type: "single",
      icon: <FiFolder className="w-6 h-6 text-blue-500" />,
      desc: "Use Single Page for static or standalone pages such as homepage, about page, or landing page templates.",
      gradient: "from-blue-50 to-blue-100/40",
    },
  ];

  return (
    <div className="flex-1 px-4 md:px-10 flex justify-center">
      {/* Wrapper Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-14"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-2 mb-4">
            Build Your First Layout
          </h2>
          <p className="max-w-2xl mx-auto text-slate-500 text-base md:text-lg leading-relaxed">
            Visually design and structure your pages using flexible, modular, and reusable
            components. Customize layouts to fit your project perfectly.
          </p>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10 max-w-5xl mx-auto">
          {cards.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -3, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`bg-gradient-to-b ${item.gradient} rounded-xl shadow-md hover:shadow-lg border border-slate-200/60 p-6 text-left h-[250px] flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-white/70 rounded-lg shadow-sm">{item.icon}</div>
                  <h3 className="text-base font-semibold text-slate-800 leading-tight">
                    {item.title}
                  </h3>
                </div>
                <p className="text-slate-600 text-justify text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <button
                onClick={() => openModal(item.type)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline mt-3 self-start"
              >
                Create New Single Page →
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ✅ Modal muncul di atas */}
      {modalOpen && modalType === "single" && (
        <PageModal title="Create Single Page" type="single" onClose={closeModal} />
      )}
    </div>
  );
}
