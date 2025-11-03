"use client";

import { useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";
import { useState } from "react";

export default function PageModal({
  title,
  type, // ✅ tambahan: menentukan jenis halaman
  onClose,
}: {
  title: string;
  type: "single" | "multi" | "component";
  onClose: () => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic");
  const [multiLang, setMultiLang] = useState(false);
  const [seo, setSeo] = useState(false);
  const [workflow, setWorkflow] = useState(false);

  const handleCreate = () => {
    onClose();

    // ✅ Arahkan sesuai type yang dikirim dari halaman
    if (type === "multi") {
      router.push("/content-builder/multi-page/home");
    } else if (type === "component") {
      router.push("/content-builder/component/home");
    } else {
      router.push("/content-builder/single-page/home");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] animate-fadeIn">
      <div className="bg-white w-[620px] rounded-2xl shadow-2xl overflow-hidden relative animate-fadeUp">
        {/* Tombol close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
        >
          <FiX size={22} />
        </button>

        {/* Header */}
        <div className="text-center pt-6 pb-3">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        </div>

        {/* Tab */}
        <div className="flex justify-center border-b">
          <button
            onClick={() => setActiveTab("basic")}
            className={`px-6 py-2.5 font-medium text-sm rounded-t-lg ${activeTab === "basic"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-800 hover:bg-slate-100"
              }`}
          >
            Basic Configuration
          </button>
          <button
            onClick={() => setActiveTab("advanced")}
            className={`px-6 py-2.5 font-medium text-sm rounded-t-lg ${activeTab === "advanced"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-800 hover:bg-slate-100"
              }`}
          >
            Advanced Configuration
          </button>
        </div>

        {/* Isi Modal */}
        <div className="p-6 space-y-6">
          {activeTab === "basic" ? (
            <>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Page Name
                </label>
                <input
                  type="text"
                  placeholder="Enter page name"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  API 
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="This will be automatically generated."
                  className="w-full border rounded-md px-3 py-2 bg-gray-50 text-gray-500 outline-none"
                />
              </div>
            </>
          ) : (
            <>
              <Toggle
                label="Multi Language"
                desc="Enable this feature to make the page support multiple languages. When activated can be displayed in different languages based user preference."
                checked={multiLang}
                onChange={() => setMultiLang(!multiLang)}
              />
              <Toggle
                label="SEO"
                desc="Enable this feature to activate SEO settings this page. When turned on, you can optimize the page content for search engines eim coach results."
                checked={seo}
                onChange={() => setSeo(!seo)}
              />
              <Toggle
                label="Workflow"
                desc="Enable this feature to activate automated workflows for user interaction. When turned on, the turned will automatically implement a structclere visibility in search results."
                checked={workflow}
                onChange={() => setWorkflow(!workflow)}
              />
            </>
          )}
        </div>

        {/* Tombol Create */}
        <div className="p-5 border-t">
          <button
            onClick={handleCreate}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-md hover:bg-blue-700 transition"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <p className="font-semibold text-slate-800">{label}</p>
        <p className="text-sm text-slate-600">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
        />
        <div
          className={`w-10 h-5 rounded-full transition-all ${checked ? "bg-blue-600" : "bg-gray-300"
            }`}
        ></div>
        <span
          className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? "translate-x-5" : "translate-x-0"
            }`}
        ></span>
      </label>
    </div>
  );
}
