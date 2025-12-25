"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiSettings } from "react-icons/fi";
import Swal from "sweetalert2";

type FieldConfig = {
  id: number | null;
  name: string;
  apiId: string;
  multiLang: boolean;
  seo: boolean;
  workflow: boolean;
};

export default function SettingsPanel({
  open,
  field,
  onClose,
  onSave,
}: {
  open: boolean;
  field: FieldConfig | null;
  onClose: () => void;
  onSave: (cfg: FieldConfig) => void;
}) {
  const [local, setLocal] = useState<FieldConfig>(
    field || {
      id: null,
      name: "",
      apiId: "",
      multiLang: false,
      seo: false,
      workflow: false,
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (!field?.id) return;

    const fetchLatest = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/content-builder/model/${field.id}`);
        const data = await res.json();

        if (data.model) {
          setLocal({
            id: data.model.id,
            name: data.model.name,
            apiId: data.model.slug,
            multiLang: !!data.model.multiLang,
            seo: !!data.model.seo,
            workflow: !!data.model.workflow,
          });
        }
      } catch (err) {
        console.error("Gagal ambil data model:", err);
      }
    };

    fetchLatest();
  }, [field]);

  useEffect(() => {
    setLocal((prev) => ({
      ...prev,
      apiId: prev.name.toLowerCase().replace(/\s+/g, "-"),
    }));
  }, [local.name]);

  const handleSave = async () => {
    try {
      const payload = {
        name: local.name,
        multiLang: local.multiLang,
        seo: local.seo,
        workflow: local.workflow,
      };

      const res = await fetch(
        `http://localhost:4000/api/content-builder/model/${local.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      // slug baru (hasil generate dari name)
      const newSlug = local.apiId;

      Swal.fire({
        title: "Success",
        text: "Configuration updated!",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });

      onSave(local);

      // ⏩ redirect ke URL baru
      setTimeout(() => {
        router.push(`/content-builder/${newSlug}`);
      }, 1200);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save settings", "error");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="settingsPanel"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 100, damping: 18 }}
          className="fixed top-16 right-0 w-[380px] h-[calc(100vh-4rem)] bg-white border-l border-slate-200 shadow-2xl z-[50] flex flex-col rounded-tl-xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 bg-white">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition"
              title="Close panel"
            >
              <FiChevronLeft size={22} />
            </button>
            <FiSettings className="text-slate-600" size={18} />
            <h3 className="font-semibold text-lg text-slate-800">
              Setting Configuration
            </h3>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 pb-28 space-y-6 bg-gray-50">
            {/* Basic Configuration */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h4 className="font-semibold text-slate-800 mb-2">
                Basic Configuration
              </h4>

              <InputField
                label="Name"
                value={local.name}
                onChange={(e: any) =>
                  setLocal({ ...local, name: e.target.value })
                }
                placeholder="Enter field name"
              />

              <InputField
                label="API ID"
                value={local.apiId}
                disabled
                note="Generated automatically"
              />

              <p className="text-xs text-slate-400">
                It’s generated automatically and used to generate API routes.
              </p>

              <Checkbox
                label="Required"
                desc="Field must be filled before saving. Empty entries will be rejected."
              />
              <Checkbox
                label="Unique"
                desc="Duplicate entries are not allowed. Value must be unique across all records."
              />
            </section>

            {/* Advanced Configuration */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
              <h4 className="font-semibold text-slate-800 mb-2">
                Advanced Configuration
              </h4>

              <Toggle
                title="Multi Language"
                desc="Enable this feature to make the page support multiple languages."
                checked={local.multiLang}
                onChange={() =>
                  setLocal({ ...local, multiLang: !local.multiLang })
                }
              />
              <Toggle
                title="SEO"
                desc="Enable this feature to activate SEO settings."
                checked={local.seo}
                onChange={() => setLocal({ ...local, seo: !local.seo })}
              />
              <Toggle
                title="Workflow"
                desc="Enable this feature to activate automated workflows."
                checked={local.workflow}
                onChange={() =>
                  setLocal({ ...local, workflow: !local.workflow })
                }
              />
            </section>
          </div>

          {/* Save Button */}
          <div className="border-t border-slate-200 bg-white p-4 sticky bottom-0 shadow-lg flex justify-end">
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Save Configuration
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/* ===== Small Components ===== */

function InputField({ label, value, onChange, disabled, placeholder, note }: any) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700 block mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={onChange}
        className={`w-full border rounded-lg px-3 py-2 text-sm ${disabled
          ? "bg-gray-100 text-slate-400"
          : "focus:ring-2 focus:ring-blue-300"
          }`}
      />
      {note && <p className="text-xs text-slate-400 mt-1">{note}</p>}
    </div>
  );
}

function Checkbox({ label, desc }: any) {
  return (
    <label className="flex items-start gap-2 text-sm text-slate-600 cursor-pointer">
      <input type="checkbox" className="mt-1 accent-blue-600" />
      <span>
        <span className="font-medium">{label}</span>
        <br />
        <span className="text-xs text-slate-500">{desc}</span>
      </span>
    </label>
  );
}

function Toggle({ title, desc, checked, onChange }: any) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="max-w-[75%]">
        <p className="font-medium text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 leading-snug">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition" />
        <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
      </label>
    </div>
  );
}
