"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiTrash2,
  FiSettings,
  FiType,
  FiImage,
  FiHash,
  FiClock,
  FiMapPin,
  FiLayers,
  FiLink,
} from "react-icons/fi";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import AddFieldModal from "../../components/AddFieldModal";
import SettingsPanel from "../../components/SettingsPanel";
import EditFieldModal from "../../components/EditFieldModal";

export default function SinglePageHome() {
  const { slug } = useParams();

  const [fields, setFields] = useState<any[]>([]);
  const [showAddField, setShowAddField] = useState(false);
  const [selectedField, setSelectedField] = useState<any | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [modelId, setModelId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [basicConfig, setBasicConfig] = useState({
    name: "",
    apiId: "",
  });

  const [advancedConfig, setAdvancedConfig] = useState({
    multiLanguage: false,
    seo: false,
    workflow: false,
  });

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`http://localhost:4000/api/content-builder/content/${slug}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (!res.ok || !data.model) {
          Swal.fire("Error", "Model tidak ditemukan di database.", "error");
          return;
        }

        setModelId(data.model.id);
        setBasicConfig({
          name: data.model.name,
          apiId: data.model.slug,
        });

        if (data.fields) setFields(data.fields);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Gagal memuat data model.", "error");
      }
    };

    fetchModel();
  }, [slug]);

  const addField = async (type: string) => {
    if (!modelId) {
      Swal.fire("Error", "Model belum dimuat.", "warning");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:4000/api/content-builder/field", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          model_id: modelId,
          label: type.charAt(0).toUpperCase() + type.slice(1),
          api_id: type.toLowerCase(),
          field_type: type,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menambah field");

      setFields([...fields, data.field || { id: data.id, label: type, field_type: type }]);
      Swal.fire("Berhasil", "Field berhasil ditambahkan.", "success");
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const deleteField = async (index: number) => {
    const confirm = await Swal.fire({
      title: "Hapus field ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (!confirm.isConfirmed) return;

    try {
      const field = fields[index];
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:4000/api/content-builder/field/${field.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      setFields(fields.filter((_, i) => i !== index));
      Swal.fire("Dihapus!", "Field berhasil dihapus.", "success");
    } catch {
      Swal.fire("Error", "Gagal menghapus field.", "error");
    }
  };

  const handleFieldClick = (field: any) => {
    setSelectedField(field);
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 flex">
      {/* ===== AREA TENGAH ===== */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mr-4">
        {/* Header tombol */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3">
            <button
              onClick={() =>
                Swal.fire("Info", "Create Field Group belum tersedia.", "info")
              }
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition"
            >
              Create Field Group
            </button>
            <button
              onClick={() => setShowAddField(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition flex items-center gap-2"
            >
              <FiPlus /> Add Field
            </button>
          </div>

          {/* Tombol Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition"
          >
            <motion.div
              animate={{ rotate: showSettings ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FiSettings size={18} />
            </motion.div>
            <span>Settings</span>
          </button>
        </div>

        {/* List field */}
        <div className="space-y-3">
          {fields.length === 0 ? (
            <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-400">
              <p>No Content Structure Yet</p>
              <p className="text-xs mt-1">
                Create a Field Group to organize your content.
              </p>
            </div>
          ) : (
            fields.map((field: any, index) => {
              // Tentukan ikon sesuai field_type
              const getFieldIcon = (type: string) => {
                switch (type) {
                  case "text": return <FiType className="text-blue-500" />;
                  case "media": return <FiImage className="text-purple-500" />;
                  case "number": return <FiHash className="text-green-500" />;
                  case "datetime": return <FiClock className="text-orange-500" />;
                  case "location": return <FiMapPin className="text-rose-500" />;
                  case "multiple": return <FiLayers className="text-sky-500" />;
                  case "relation": return <FiLink className="text-yellow-500" />;
                  case "richtext": return <FiType className="text-indigo-500" />;
                  default: return <FiSettings className="text-slate-400" />;
                }
              };

              return (
                <motion.div
                  key={field.id || index}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => handleFieldClick(field)}
                  className={`flex justify-between items-center border rounded-lg p-4 cursor-pointer transition-all ${selectedField?.id === field.id
                    ? "bg-blue-50 border-blue-400"
                    : "bg-white hover:bg-slate-50"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-50 rounded-lg shadow-sm">
                      {getFieldIcon(field.field_type)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 leading-tight">
                        {field.field_name || "Untitled Field"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 capitalize">
                        {field.field_type}
                      </p>
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
              );
            })
          )}
        </div>
      </div>

      {/* Panel kanan untuk Settings Configuration */}
      <SettingsPanel
        open={showSettings}
        field={{
          id: modelId,
          name: basicConfig.name,
          apiId: basicConfig.apiId,
          multiLang: advancedConfig.multiLanguage,
          seo: advancedConfig.seo,
          workflow: advancedConfig.workflow,
        }}
        onClose={() => setShowSettings(false)}
        onSave={(updatedConfig) => {
          setBasicConfig({
            name: updatedConfig.name,
            apiId: updatedConfig.apiId,
          });
          setAdvancedConfig({
            multiLanguage: updatedConfig.multiLang,
            seo: updatedConfig.seo,
            workflow: updatedConfig.workflow,
          });
          Swal.fire("Saved", "Configuration updated!", "success");
          setShowSettings(false);
        }}
      />

      {/* Modal Add Field */}
      {showAddField && (
        <AddFieldModal
          onClose={() => setShowAddField(false)}
          onSelect={(type) => addField(type)}
        />
      )}

      {showEditModal && selectedField && (
        <EditFieldModal
          fieldId={selectedField.id}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            Swal.fire("Updated", "Field updated successfully!", "success");
            // refresh field list
            const token = localStorage.getItem("token");
            fetch(`http://localhost:4000/api/content-builder/content/${slug}`, {
              headers: {
                "Authorization": `Bearer ${token}`,
              }
            })
              .then((res) => res.json())
              .then((data) => setFields(data.fields));
          }}
        />
      )}
    </div>
  );
}
