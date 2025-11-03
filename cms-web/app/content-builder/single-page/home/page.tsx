"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiTrash2,
  FiSettings,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import AddFieldModal from "../../components/AddFieldModal";

export default function SinglePageHome() {
  const [fields, setFields] = useState<string[]>([]);
  const [showAddField, setShowAddField] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [basicOpen, setBasicOpen] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [basicConfig, setBasicConfig] = useState({
    name: "",
    apiId: "",
  });

  const [advancedConfig, setAdvancedConfig] = useState({
    multiLanguage: false,
    seo: false,
    workflow: false,
  });

  const addField = (type: string) => {
    setFields([...fields, type]);
  };

  const deleteField = (index: number) => {
    Swal.fire({
      title: "Delete this field?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    }).then((result) => {
      if (result.isConfirmed) {
        setFields(fields.filter((_, i) => i !== index));
        if (selectedField === fields[index]) setSelectedField(null);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Field has been removed.",
          timer: 1600,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleSave = () => {
    Swal.fire({
      icon: "success",
      title: "Configuration Saved",
      text: "All settings have been saved successfully!",
      timer: 1800,
      showConfirmButton: false,
    });
  };

  const handleCreateGroup = () => {
    Swal.fire({
      icon: "info",
      title: "Feature Coming Soon",
      text: "Create Field Group will be available in the next update!",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleAddField = () => {
    setShowAddField(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="flex">
        {/* ===== AREA TENGAH ===== */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mr-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3">
              <button
                onClick={handleCreateGroup}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition"
              >
                Create Field Group
              </button>
              <button
                onClick={handleAddField}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition flex items-center gap-2"
              >
                <FiPlus /> Add Field
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {fields.length === 0 ? (
              <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-400">
                <p>No Content Structure Yet</p>
                <p className="text-xs mt-1">
                  Create a Field Group to organize your content.
                </p>
              </div>
            ) : (
              fields.map((field, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  className={`flex justify-between items-center border rounded-lg p-3 cursor-pointer transition ${selectedField === field
                      ? "bg-blue-50 border-blue-400"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  onClick={() => setSelectedField(field)}
                >
                  <div className="flex items-center gap-2">
                    <FiSettings className="text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {field}
                      </p>
                      <p className="text-xs text-slate-500">Short Text</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteField(index);
                    }}
                    className="text-red-500 hover:text-red-600 transition"
                  >
                    <FiTrash2 />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* ===== PANEL KANAN (SETTING CONFIGURATION) ===== */}
        {selectedField && (
          <div className="w-[360px] bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <FiSettings className="text-blue-600 w-5 h-5" />
              <h3 className="font-semibold text-slate-700">
                Setting Configuration
              </h3>
            </div>

            {/* Basic Configuration */}
            <div className="border-b border-slate-200 pb-3 mb-3">
              <button
                onClick={() => setBasicOpen(!basicOpen)}
                className="flex items-center justify-between w-full mb-2"
              >
                <span className="text-sm font-semibold text-slate-700">
                  Basic Configuration
                </span>
                {basicOpen ? (
                  <FiChevronUp className="text-slate-500" />
                ) : (
                  <FiChevronDown className="text-slate-500" />
                )}
              </button>

              {basicOpen && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={basicConfig.name}
                      onChange={(e) =>
                        setBasicConfig({
                          ...basicConfig,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter field name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      API ID
                    </label>
                    <input
                      type="text"
                      value={basicConfig.apiId}
                      onChange={(e) =>
                        setBasicConfig({
                          ...basicConfig,
                          apiId: e.target.value,
                        })
                      }
                      placeholder="Generated automatically"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

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
                          Field must be filled before saving. Empty entries will
                          be rejected.
                        </span>
                      </span>
                    </label>

                    <label className="flex items-start gap-2 text-sm text-slate-600">
                      <input type="checkbox" className="mt-1" />
                      <span>
                        <span className="font-medium">Unique</span>
                        <br />
                        <span className="text-xs text-slate-500">
                          Duplicate entries are not allowed. Value must be
                          unique across all records.
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Configuration */}
            <div className="border-b border-slate-200 pb-3 mb-3">
              <button
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="flex items-center justify-between w-full mb-2"
              >
                <span className="text-sm font-semibold text-slate-700">
                  Advanced Configuration
                </span>
                {advancedOpen ? (
                  <FiChevronUp className="text-slate-500" />
                ) : (
                  <FiChevronDown className="text-slate-500" />
                )}
              </button>

              {advancedOpen && (
                <div className="space-y-3">
                  <ToggleOption
                    label="Multi Language"
                    desc="Enable this feature to make the page support multiple languages. When activated can be displayed in different languages based user preference."
                    checked={advancedConfig.multiLanguage}
                    onChange={(checked) =>
                      setAdvancedConfig({
                        ...advancedConfig,
                        multiLanguage: checked,
                      })
                    }
                  />
                  <ToggleOption
                    label="SEO"
                    desc="Enable this feature to activate SEO settings this page. When turned on, you can optimize the page content for search engines eim coach results."
                    checked={advancedConfig.seo}
                    onChange={(checked) =>
                      setAdvancedConfig({
                        ...advancedConfig,
                        seo: checked,
                      })
                    }
                  />
                  <ToggleOption
                    label="Workflow"
                    desc="Enable this feature to activate automated workflows for user interaction. When turned on, the turned will automatically implement a structclere visibility in search results."
                    checked={advancedConfig.workflow}
                    onChange={(checked) =>
                      setAdvancedConfig({
                        ...advancedConfig,
                        workflow: checked,
                      })
                    }
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition"
            >
              Save Configuration
            </button>
          </div>
        )}
      </div>

      {/* Modal Add Field */}
      {showAddField && (
        <AddFieldModal
          onClose={() => setShowAddField(false)}
          onSelect={(type) => addField(type)}
        />
      )}
    </div>
  );
}

/* Komponen ToggleOption */
function ToggleOption({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-500 relative transition-all">
          <div
            className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? "translate-x-5" : "translate-x-0"
              }`}
          />
        </div>
      </label>
    </div>
  );
}
