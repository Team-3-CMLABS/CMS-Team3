"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { FiArrowLeft } from "react-icons/fi";

export default function NewApiTokenPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        desc: "",
        validity: "7 Days",
        scope: "Custom",
    });

    const [checked, setChecked] = useState({
        create: true,
        delete: true,
        findOne: false,
        update: true,
        find: false,
    });

    const [selectedPeriod, setSelectedPeriod] = useState(form.validity || "7 Days");
    const [openPeriod, setOpenPeriod] = useState(false);
    const [selectedScope, setSelectedScope] = useState(form.scope || "Custom");
    const [openScope, setOpenScope] = useState(false);

    const periodRef = useRef(null);
    const scopeRef = useRef(null);

    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            if (periodRef.current && !(periodRef.current as any).contains(e.target)) {
                setOpenPeriod(false);
            }
            if (scopeRef.current && !(scopeRef.current as any).contains(e.target)) {
                setOpenScope(false);
            }
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    useEffect(() => {
        setForm((prev) => ({ ...prev, validity: selectedPeriod }));
    }, [selectedPeriod]);

    useEffect(() => {
        setForm((prev) => ({ ...prev, scope: selectedScope }));
    }, [selectedScope]);

    const handleSave = async () => {
        if (!form.name.trim()) {
            Swal.fire({
                icon: "error",
                title: "Missing Field",
                text: "Please enter the token name!",
            });
            return;
        }

        await Swal.fire({
            icon: "success",
            title: "Token Created!",
            text: `API Token "${form.name}" successfully created.`,
            showConfirmButton: false,
            timer: 1500,
        });

        router.push("/settings");
    };

    const periodOptions = ["7 Days", "30 Days", "90 Days", "Custom"];
    const scopeOptions = ["Custom", "Full Access", "Read Only", "Admin"];

    return (
        <div className="flex min-h-screen bg-[#F5F7FA]">
            <Sidebar />

            <div className="flex flex-col flex-1 ml-64">
                <Topbar />

                <main className="p-6 flex-1 overflow-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white border border-gray-200 rounded-xl shadow-sm p-6"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-lg font-semibold text-gray-800">
                                    Create a New API Token
                                </h1>
                                <p className="text-xs text-gray-500 mt-1">
                                    Optimize your API and Integration management.
                                </p>
                            </div>

                            <Button
                                onClick={handleSave}
                                className="bg-green-600 hover:bg-green-700 text-white text-sm px-5 py-2 rounded-md"
                            >
                                Save
                            </Button>
                        </div>

                        {/* Form Section */}
                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Name */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        API Token Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="name"
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, name: e.target.value }))
                                        }
                                        placeholder="Custom Token"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <input
                                        name="desc"
                                        type="text"
                                        value={form.desc}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, desc: e.target.value }))
                                        }
                                        placeholder="Tokens that can only be CUD"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Validity Period */}
                                <div className="flex flex-col gap-1" ref={periodRef}>
                                    <label className="text-sm font-medium text-gray-700">
                                        Validity Period
                                    </label>
                                    <div className="relative w-full">
                                        <button
                                            type="button"
                                            onClick={() => setOpenPeriod((s) => !s)}
                                            className="w-full flex justify-between items-center border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white hover:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                                            aria-expanded={openPeriod}
                                        >
                                            <span>{selectedPeriod || "Select Period"}</span>
                                            <svg
                                                className={`w-4 h-4 text-gray-500 ml-2 transition-transform ${openPeriod ? "rotate-180" : ""
                                                    }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </button>

                                        {openPeriod && (
                                            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                                                {periodOptions.map((item) => (
                                                    <div
                                                        key={item}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedPeriod(item);
                                                            setOpenPeriod(false);
                                                        }}
                                                        className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                                    >
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Access Scope */}
                                <div className="flex flex-col gap-1" ref={scopeRef}>
                                    <label className="text-sm font-medium text-gray-700">
                                        Access Scope
                                    </label>
                                    <div className="relative w-full">
                                        <button
                                            type="button"
                                            onClick={() => setOpenScope((s) => !s)}
                                            className="w-full flex justify-between items-center border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white hover:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                                            aria-expanded={openScope}
                                        >
                                            <span>{selectedScope || "Select Scope"}</span>
                                            <svg
                                                className={`w-4 h-4 text-gray-500 ml-2 transition-transform ${openScope ? "rotate-180" : ""
                                                    }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </button>

                                        {openScope && (
                                            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                                                {scopeOptions.map((item) => (
                                                    <div
                                                        key={item}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedScope(item);
                                                            setOpenScope(false);
                                                        }}
                                                        className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                                    >
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 italic mb-6">
                                If the Validity Period has passed, the API will be deleted automatically.
                            </p>

                            {/* Access Section */}
                            <div className="border border-gray-200 rounded-lg bg-[#F9FBFC] p-0 overflow-hidden">
                                <div className="px-4 py-2 bg-[#2563EB]">
                                    <h3 className="text-white text-sm font-medium">
                                        Customizable Content Models &amp; Schema
                                    </h3>
                                </div>

                                <div className="p-4">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                                        <input
                                            type="checkbox"
                                            checked={Object.values(checked).every(Boolean)}
                                            onChange={() => {
                                                const all = !Object.values(checked).every(Boolean);
                                                setChecked({
                                                    create: all,
                                                    delete: all,
                                                    findOne: all,
                                                    update: all,
                                                    find: all,
                                                });
                                            }}
                                            className="accent-[#2563EB]"
                                        />
                                        Select all
                                    </label>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm text-gray-700">
                                        {Object.entries(checked).map(([key, val]) => {
                                            const label = `${key
                                                .replace(/([A-Z])/g, " $1")
                                                .replace(/^./, (c) => c.toUpperCase())} Content Model`;
                                            return (
                                                <label key={key} className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={val}
                                                        onChange={() =>
                                                            setChecked((prev) => ({
                                                                ...prev,
                                                                [key]: !prev[key as keyof typeof checked],
                                                            }))
                                                        }
                                                        className="accent-[#2563EB]"
                                                    />
                                                    <span>{label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
