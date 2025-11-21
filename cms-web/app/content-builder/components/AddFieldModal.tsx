"use client";

import {
  FiX,
  FiType,
  FiImage,
  FiHash,
  FiClock,
  FiMapPin,
  FiLayers,
  FiLink,
  FiEdit3,
} from "react-icons/fi";
import { motion } from "framer-motion";

export default function AddFieldModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect?: (type: string) => void;
}) {
  const fields = [
    { id: "text", icon: <FiType className="text-blue-500 w-5 h-5" />, title: "Text Field", desc: "Used for short free text, such as titles, names, or tags." },
    { id: "media", icon: <FiImage className="text-purple-500 w-5 h-5" />, title: "Media Field", desc: "Upload and manage images, videos, documents." },
    { id: "number", icon: <FiHash className="text-green-500 w-5 h-5" />, title: "Number", desc: "Numeric input, prices, quantities." },
    { id: "datetime", icon: <FiClock className="text-orange-500 w-5 h-5" />, title: "Date and Time", desc: "Date/time with formatting." },
    { id: "location", icon: <FiMapPin className="text-rose-500 w-5 h-5" />, title: "Location", desc: "Location or long text fields." },
    { id: "multiple", icon: <FiLayers className="text-sky-500 w-5 h-5" />, title: "Multiple Content", desc: "Repeatable content blocks." },
    { id: "relation", icon: <FiLink className="text-yellow-500 w-5 h-5" />, title: "Relations", desc: "Link records between collections." },
    { id: "richtext", icon: <FiEdit3 className="text-pink-500 w-5 h-5" />, title: "Rich Text", desc: "For formatted text content such as body, descriptions, or articles." },
  ];

  const handleSelect = (id: string) => {
    if (onSelect) onSelect(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-[640px] max-w-[95%] p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
        >
          <FiX size={20} />
        </button>

        <h3 className="text-lg font-semibold text-slate-900 text-center mb-4">
          Add Field Type
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {fields.map((f) => (
            <button
              key={f.id}
              onClick={() => handleSelect(f.id)}
              className="flex items-start gap-3 border border-slate-200 hover:border-blue-300 rounded-lg p-4 text-left hover:bg-blue-50 transition"
              type="button"
            >
              <div className="p-2 bg-white rounded-md shadow-sm">{f.icon}</div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">{f.title}</h4>
                <p className="text-xs text-slate-500 leading-snug mt-1">{f.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
