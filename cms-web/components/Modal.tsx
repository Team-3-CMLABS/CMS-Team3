"use client";

import { useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";
import { useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function PageModal({
  title,
  type,
  onClose,
}: {
  title: string;
  type: "single";
  onClose: () => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic");
  const [multiLang, setMultiLang] = useState(false);
  const [seo, setSeo] = useState(false);
  const [workflow, setWorkflow] = useState(false);
  const [pageName, setPageName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!pageName.trim()) {
      Swal.fire("Error", "Please enter a page name", "error");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token"); // ⬅️ Tambahkan ini

      const res = await fetch("http://localhost:4000/api/content-builder/model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ⬅️ Tambahkan ini
        },
        body: JSON.stringify({
          name: pageName,
          type,
          multiLang,
          seo,
          workflow,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire("Error", data.message || "Failed to create page", "error");
        setLoading(false);
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "New page has been created successfully 🎉",
        timer: 1500,
        showConfirmButton: false,
      });

      onClose();

      setTimeout(() => {
        router.push(`/content-builder/${data.model.slug}`);
      }, 1000);
    } catch (err) {
      Swal.fire("Error", "Server error, please try again.", "error");
      console.error("createPage error:", err);
    } finally {
      setLoading(false);
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

        {/* Tabs */}
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
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  API Endpoint
                </label>
                <input
                  type="text"
                  disabled
                  value={
                    pageName
                      ? `/api/content/${pageName.toLowerCase().replace(/\s+/g, "-")}`
                      : "This will be automatically generated."
                  }
                  className="w-full border rounded-md px-3 py-2 bg-gray-50 text-gray-500 outline-none"
                />
              </div>
            </>
          ) : (
            <>
              <Toggle
                label="Multi Language"
                desc="Enable multilingual support for this page."
                checked={multiLang}
                onChange={() => setMultiLang(!multiLang)}
              />
              <Toggle
                label="SEO"
                desc="Enable SEO optimization options for this page."
                checked={seo}
                onChange={() => setSeo(!seo)}
              />
              <Toggle
                label="Workflow"
                desc="Enable workflow automation for this page."
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
            disabled={loading}
            className={`w-full bg-blue-600 text-white font-semibold py-2.5 rounded-md transition ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Komponen Toggle */
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
