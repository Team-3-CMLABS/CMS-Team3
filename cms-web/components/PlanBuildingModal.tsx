"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface Plan {
  id: number | string;
  name: string;
  price: number | string;
  description: string;
  features?: string[] | string;
}

export default function PlanBuildingModal({
  onClose,
  show,
}: {
  onClose: () => void;
  show: boolean;
}) {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    if (!show) return;

    const userId = localStorage.getItem("userId");
    if (!userId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/check/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.hasPayment) {
          console.log("User has payment");
        } else {
          console.log("User has no payment");
        }
      })
      .catch((err) => console.error("Gagal cek payment:", err));
  }, [show]);

  // ✅ Ambil data plans dari backend
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/plans`)
      .then((res) => res.json())
      .then((data) => setPlans(data))
      .catch((err) => console.error("Gagal memuat data plan:", err));
  }, []);

  // 🔹 Plan manual khusus untuk "White Label"
  const whiteLabelPlan = {
    name: "White Label",
    price: "Custom Plan",
    description:
      "Own your CMS platform with full branding, configuration, and source code.",
    features: [
      "Full Source Code Access",
      "Custom Branding",
      "Fully Configurable",
      "CMS Ownership",
      "Lifetime License",
    ],
    button: "Contact Us",
    color:
      "bg-gradient-to-r from-sky-400 to-teal-400 hover:from-sky-500 hover:to-teal-500 text-gray-900 font-semibold",
  };

  // 🔹 Ketika user memilih plan
  const handleSelectPlan = (planName: string, price: number | string) => {
    onClose();

    if (planName === "White Label") {
      router.push("/contact");
      return;
    }

    router.push(`/payment?plan=${encodeURIComponent(planName)}&price=${price}`);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-6"
        >
          <div className="absolute inset-0" onClick={onClose}></div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className="relative w-full max-w-7xl rounded-3xl overflow-y-auto max-h-[90vh] p-10
              bg-gradient-to-br from-sky-100 via-indigo-100 to-emerald-100
              border border-white/50 shadow-[0_8px_40px_rgba(56,189,248,0.3)]
              backdrop-blur-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-transparent opacity-50 pointer-events-none rounded-3xl"></div>

            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-gray-700 hover:text-blue-700 transition"
            >
              <X size={28} />
            </button>

            <div className="text-center mb-10 relative z-10">
              <h1 className="text-4xl font-extrabold text-gray-900">
                Choose Your Plan
              </h1>
              <p className="text-gray-600 mt-3 text-base">
                Select the plan that matches your needs and workflow.
              </p>
            </div>

            {/* ✅ Daftar Plan dari Backend + White Label */}
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
              {plans.length > 0 ? (
                <>
                  {plans.map((plan, index) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group bg-white/80 border border-blue-200 rounded-2xl shadow-md 
                        hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] 
                        transition-all duration-300 p-6 flex flex-col justify-between"
                    >
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-1">
                          {plan.name}
                        </h2>
                        <p className="text-3xl font-bold text-blue-600 mb-2">
                          {typeof plan.price === "number" ? `$${plan.price.toFixed(2)} / month` : plan.price}
                        </p>
                        <p className="text-sm text-gray-600 mb-5">
                          {plan.description}
                        </p>

                        {plan.features && (
                          <ul className="space-y-2 mb-8">
                            {Object.values(
                              typeof plan.features === "string"
                                ? JSON.parse(plan.features)
                                : plan.features
                            ).map((f, i) => (
                              <li key={i} className="flex items-start text-sm text-gray-700">
                                <span className="text-blue-500 mr-2">✔</span>
                                <span>{String(f)}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <Button
                        onClick={() => handleSelectPlan(plan.name, plan.price)}
                        className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white w-full font-semibold py-2 rounded-lg shadow-md hover:shadow-lg transition"
                      >
                        {plan.name === "Free / Demo" ? "Get Started" : "Purchase"}
                      </Button>
                    </motion.div>
                  ))}

                  {/* ✅ White Label Plan Manual */}
                  <motion.div
                    key="white-label"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: plans.length * 0.1 }}
                    className="group bg-white/80 border border-blue-200 rounded-2xl shadow-md 
                      hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] 
                      transition-all duration-300 p-6 flex flex-col justify-between"
                  >
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">
                        {whiteLabelPlan.name}
                      </h2>
                      <p className="text-3xl font-bold text-blue-600 mb-2">
                        {whiteLabelPlan.price}
                      </p>
                      <p className="text-sm text-gray-600 mb-5">
                        {whiteLabelPlan.description}
                      </p>

                      <ul className="space-y-2 mb-8">
                        {whiteLabelPlan.features.map((f, i) => (
                          <li
                            key={i}
                            className="flex items-start text-sm text-gray-700"
                          >
                            <span className="text-blue-500 mr-2">✔</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      onClick={() =>
                        handleSelectPlan(whiteLabelPlan.name, whiteLabelPlan.price)
                      }
                      className={`${whiteLabelPlan.color} w-full font-semibold py-2 rounded-lg shadow-md hover:shadow-lg transition`}
                    >
                      {whiteLabelPlan.button}
                    </Button>
                  </motion.div>
                </>
              ) : (
                <p className="text-center col-span-4 text-gray-500">
                  Loading plans...
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
