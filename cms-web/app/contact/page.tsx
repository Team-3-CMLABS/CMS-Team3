"use client";

import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-teal-50 flex flex-col items-center justify-center p-6 relative">
      {/* Tombol Back */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="bg-white/80 backdrop-blur-xl shadow-xl border border-sky-100 rounded-3xl w-full max-w-3xl p-10 mt-10">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Contact Us
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Have questions or want to discuss a custom plan? We’d love to hear from you!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Info Kontak */}
          <div className="space-y-3 text-gray-700">
            <p className="flex items-center gap-3">
              <Mail className="text-sky-500" /> support@cmlabs.com
            </p>
            <p className="flex items-center gap-3">
              <Phone className="text-sky-500" /> +62 812 3456 7890
            </p>
            <p className="flex items-center gap-3">
              <MapPin className="text-sky-500" /> Jakarta, Indonesia
            </p>
          </div>

          {/* Form Kontak */}
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-sky-400 outline-none"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-sky-400 outline-none"
            />
            <textarea
              placeholder="Your Message"
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-sky-400 outline-none resize-none"
            />
            <Button className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:from-sky-600 hover:to-indigo-700 shadow-md font-semibold">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
