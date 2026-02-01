"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

type EditFieldModalProps = {
    fieldId: number | null;
    onClose: () => void;
    onSave: () => void;
};

type FieldData = {
    field_name?: string;
    field_key?: string;
    field_type: string;
    is_required: number;
};

export default function EditFieldModal({ fieldId, onClose, onSave, }: EditFieldModalProps) {
    const [fieldData, setFieldData] = useState<FieldData | null>(null);

    useEffect(() => {
        if (!fieldId) return;
        const fetchField = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content-builder/field/${fieldId}`);
                const data = await res.json();
                if (res.ok) setFieldData(data.field);
                else Swal.fire("Error", data.message || "Gagal memuat data field", "error");
            } catch {
                Swal.fire("Error", "Gagal mengambil field", "error");
            }
        };
        fetchField();
    }, [fieldId]);

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content-builder/field/${fieldId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(fieldData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Gagal update field");

            Swal.fire("Berhasil", "Field berhasil diperbarui", "success");
            onSave();
            onClose();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Gagal update field";
            Swal.fire("Error", message, "error");
        }
    };

    if (!fieldData) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg w-[400px] p-6">
                <h2 className="text-lg font-semibold mb-4">Edit Field</h2>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Field Name</label>
                        <input
                            value={fieldData.field_name || ""}
                            onChange={(e) =>
                                setFieldData({ ...fieldData, field_name: e.target.value })
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Field Key</label>
                        <input
                            value={fieldData.field_key || ""}
                            onChange={(e) =>
                                setFieldData({ ...fieldData, field_key: e.target.value })
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Field Type</label>
                        <select
                            value={fieldData.field_type}
                            onChange={(e) =>
                                setFieldData({ ...fieldData, field_type: e.target.value })
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="text">Text</option>
                            <option value="richtext">Rich Text</option>
                            <option value="media">Media</option>
                            <option value="number">Number</option>
                            <option value="datetime">Date Time</option>
                            <option value="location">Location</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={fieldData.is_required === 1}
                            onChange={(e) =>
                                setFieldData({ ...fieldData, is_required: e.target.checked ? 1 : 0 })
                            }
                        />
                        <span className="text-sm text-slate-600">Required</span>
                    </div>
                </div>

                <div className="flex justify-end mt-6 gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border text-slate-600 hover:bg-slate-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
