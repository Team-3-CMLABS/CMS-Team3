"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiTrash2,
  FiSettings,
  FiSave,
} from "react-icons/fi";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import AddFieldModal from "../../components/AddFieldModal";
import SettingsPanel from "../../components/SettingsPanel";

export default function SinglePageHome() {
  const { slug } = useParams();

  const [fields, setFields] = useState<any[]>([]);
  const [showAddField, setShowAddField] = useState(false);
  const [selectedField, setSelectedField] = useState<any | null>(null);
  const [showSettings, setShowSettings] = useState(false); // 👈 untuk panel kanan
  const [modelId, setModelId] = useState<number | null>(null);

  const [basicConfig, setBasicConfig] = useState({
    name: "",
    apiId: "",
  });

  const [advancedConfig, setAdvancedConfig] = useState({
    multiLanguage: false,
    seo: false,
    workflow: false,
  });

  // ✅ Ambil model dan field dari backend
  useEffect(() => {
    const fetchModel = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/content/${slug}`);
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

  // ✅ Tambah Field
  const addField = async (type: string) => {
    if (!modelId) {
      Swal.fire("Error", "Model belum dimuat.", "warning");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/content-builder/field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_id: modelId,
          label: type.charAt(0).toUpperCase() + type.slice(1),
          api_id: type.toLowerCase(),
          field_type: type,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menambah field");

      // simpan objek field baru
      setFields([...fields, data.field || { id: data.id, label: type, field_type: type }]);
      Swal.fire("Berhasil", "Field berhasil ditambahkan.", "success");
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // ✅ Hapus Field
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
      await fetch(`http://localhost:4000/api/content-builder/field/${field.id}`, {
        method: "DELETE",
      });

      setFields(fields.filter((_, i) => i !== index));
      Swal.fire("Dihapus!", "Field berhasil dihapus.", "success");
    } catch {
      Swal.fire("Error", "Gagal menghapus field.", "error");
    }
  };

  // ✅ Simpan Model
  const handleSave = async () => {
    try {
      const payload = {
        name: basicConfig.name,
        slug: basicConfig.apiId,
        type: "single",
        api_endpoint: `/api/content/${basicConfig.apiId}`,
        fields: fields.map((f) => ({
          type: f.field_type,
          name: f.label,
        })),
        config: advancedConfig,
      };

      const res = await fetch("http://localhost:4000/api/content-builder/model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save content");

      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: "All changes have been saved successfully.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // ✅ Saat klik field
  const handleFieldClick = (field: any) => {
    setSelectedField(field);
    setShowSettings(true);
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

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition"
          >
            <FiSave />
            Save Changes
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
            fields.map((field: any, index) => (
              <motion.div
                key={field.id || index}
                whileHover={{ scale: 1.01 }}
                onClick={() => handleFieldClick(field)} // 👈 klik field buka panel
                className={`flex justify-between items-center border rounded-lg p-3 cursor-pointer ${selectedField?.id === field.id
                  ? "bg-blue-50 border-blue-400"
                  : "bg-white hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <FiSettings className="text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{field.label}</p>
                    <p className="text-xs text-slate-500 capitalize">
                      {field.field_type}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // biar gak buka panel
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

      {/* Panel kanan */}
      {showSettings && selectedField && (
        <SettingsPanel
          open={showSettings}
          field={{
            id: selectedField.id,
            name: selectedField.label,
            apiId: selectedField.api_id || selectedField.field_key || "",
            multiLang: false,
            seo: false,
            workflow: false,
          }}
          onClose={() => setShowSettings(false)}
          onSave={(updatedField) => {
            setFields((prev) =>
              prev.map((f) =>
                f.id === updatedField.id
                  ? { ...f, label: updatedField.name, field_key: updatedField.apiId }
                  : f
              )
            );
            Swal.fire("Saved", "Configuration updated!", "success");
            setShowSettings(false);
          }}
        />
      )}

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
