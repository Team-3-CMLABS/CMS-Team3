"use client";

import { useState, useEffect } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

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
  // local form state (karena ingin edit tanpa langsung commit)
  const [local, setLocal] = useState<FieldConfig>({
    id: null,
    name: "",
    apiId: "",
    multiLang: false,
    seo: false,
    workflow: false,
  });

  // accordion state
  const [basicOpen, setBasicOpen] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    if (field) {
      setLocal(field);
    } else {
      setLocal({
        id: null,
        name: "",
        apiId: "",
        multiLang: false,
        seo: false,
        workflow: false,
      });
    }
  }, [field]);

  const handleSave = () => {
    onSave(local);
  };

  if (!open) return null;

  return (
    <aside className="w-80 bg-white border-l border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-700">Setting Configuration</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          ✕
        </button>
      </div>

      {/* Basic Accordion */}
      <div className="mb-3 border rounded-lg overflow-hidden">
        <button
          onClick={() => setBasicOpen(!basicOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50"
        >
          <span className="font-medium text-slate-700">Basic Configuration</span>
          {basicOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {basicOpen && (
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Name</label>
              <input
                value={local.name ?? ""}
                onChange={(e) => setLocal({ ...local, name: e.target.value })}
                placeholder="Enter field name"
                className="w-full border rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">API ID</label>
              <input
                value={local.apiId ?? ""}
                disabled
                placeholder="Generated automatically"
                className="w-full border rounded-md px-3 py-2 bg-gray-50 text-sm text-slate-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                API ID is generated automatically and used for API routes.
              </p>
            </div>

            {/* Tambahan teks deskripsi dan checkbox */}
            <p className="text-xs text-slate-500 mt-1">
              It’s generated automatically and used to generate API routes
            </p>

            <div className="mt-2 space-y-2">
              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input type="checkbox" className="mt-1" />
                <span>
                  <span className="font-medium">Required</span>
                  <br />
                  <span className="text-xs text-slate-500">
                    Field must be filled before saving. Empty entries will be rejected.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input type="checkbox" className="mt-1" />
                <span>
                  <span className="font-medium">Unique</span>
                  <br />
                  <span className="text-xs text-slate-500">
                    Duplicate entries are not allowed. Value must be unique across all records.
                  </span>
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Accordion */}
      <div className="mb-4 border rounded-lg overflow-hidden">
        <button
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50"
        >
          <span className="font-medium text-slate-700">Advanced Configuration</span>
          {advancedOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {advancedOpen && (
          <div className="p-4 space-y-4">
            <Toggle
              title="Multi Language"
              desc="Enable this feature to make the page support multiple languages. When activated can be displayed in different languages based user preference."
              checked={local.multiLang}
              onChange={() => setLocal({ ...local, multiLang: !local.multiLang })}
            />
            <Toggle
              title="SEO"
              desc="Enable this feature to activate SEO settings this page. When turned on, you can optimize the page content for search engines eim coach results."
              checked={local.seo}
              onChange={() => setLocal({ ...local, seo: !local.seo })}
            />
            <Toggle
              title="Workflow"
              desc="Enable this feature to activate automated workflows for user interaction. When turned on, the turned will automatically implement a structclere visibility in search results."
              checked={local.workflow}
              onChange={() => setLocal({ ...local, workflow: !local.workflow })}
            />
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-2.5 rounded-md font-semibold hover:bg-blue-700"
        >
          Save Configurations
        </button>
      </div>
    </aside>
  );
}

/* small toggle component */
function Toggle({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start justify-between">
      <div className="max-w-[75%]">
        <div className="font-medium text-slate-800">{title}</div>
        <div className="text-xs text-slate-500">{desc}</div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer ml-2">
        <input className="sr-only" type="checkbox" checked={checked} onChange={onChange} />
        <div className={`w-10 h-5 rounded-full ${checked ? "bg-blue-600" : "bg-gray-300"}`}></div>
        <span className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}></span>
      </label>
    </div>
  );
}
