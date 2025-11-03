"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FiFileText, FiFolder, FiLayout } from "react-icons/fi";

export default function ContentBuilderPage() {
  const cards = [
    {
      title: "Single Page",
      href: "/content-builder/single-page",
      icon: <FiFileText className="w-6 h-6 text-blue-500" />,
      desc: "Ideal for single pages such as blog posts, products, or portfolios with unique structures.",
      gradient: "from-blue-50 to-blue-100/40",
    },
    {
      title: "Multi Page",
      href: "/content-builder/multi-page",
      icon: <FiFolder className="w-6 h-6 text-indigo-500" />,
      desc: "Suitable for content collections such as blogs, teams, or product catalogs with a uniform structure.",
      gradient: "from-indigo-50 to-indigo-100/40",
    },
    {
      title: "Component",
      href: "/content-builder/component",
      icon: <FiLayout className="w-6 h-6 text-cyan-500" />,
      desc: "Use it to create reusable components such as banners, galleries, or text sections.",
      gradient: "from-cyan-50 to-cyan-100/40",
    },
  ];

  return (
    <div className="flex-1 px-4 md:px-10 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-2 mb-4">
            Content Builder
          </h2>
          <p className="max-w-2xl mx-auto text-slate-500 text-base md:text-lg leading-relaxed">
            Choose the type of content you want to create — single pages, multi-page collections,
            or reusable components to build your site structure visually and flexibly.
          </p>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10 max-w-5xl mx-auto">
          {cards.map((item, index) => (
            <Link key={index} href={item.href}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className={`bg-gradient-to-b ${item.gradient} rounded-xl shadow-md hover:shadow-lg border border-slate-200/60 p-6 text-left h-[230px] flex flex-col justify-between cursor-pointer`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-white/70 rounded-lg shadow-sm">
                      {item.icon}
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 leading-tight">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-slate-600 text-justify text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
