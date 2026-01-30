"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Database, Settings, Shield, Globe, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-blue-100 text-slate-800 font-sans scroll-smooth">
            {/* ===== Navbar ===== */}
            <nav className="flex justify-between items-center px-8 md:px-16 py-4 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <a href="#hero" className="flex items-center gap-3">
                        <Image src="/logo.png" alt="CMS Logo" width={40} height={40} />
                        <span className="font-bold text-2xl text-black-700 tracking-tight">CMS Team 3</span>
                    </a>
                </div>

                <div className="hidden md:flex items-center gap-8 font-medium text-slate-700">
                    <a href="#features" className="hover:text-blue-700 transition">Features</a>
                    <a href="#about" className="hover:text-blue-700 transition">About</a>
                    <a href="#contact" className="hover:text-blue-700 transition">Contact</a>
                </div>

                <button
                    onClick={() => router.push("/login")}
                    className="bg-blue-700 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-800 transition-all shadow-sm"
                >
                    Login Now
                </button>
            </nav>

            {/* ===== Hero Section ===== */}
            <section id="hero" className="flex flex-col md:flex-row items-center justify-between px-10 md:px-20 mt-12 md:mt-20 gap-10">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                    className="md:w-1/2 space-y-5"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-snug">
                        Transform the way you publish and manage content with the power of
                        modern technology
                    </h1>
                    <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                        Create and manage all your website content seamlessly using CMS Name —
                        the modern platform built for flexibility, performance, and simplicity.
                    </p>
                    <div className="flex gap-3">
                        <a
                            href="#about"
                            className="border border-blue-700 text-blue-700 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all shadow-md"
                        >
                            Learn More
                        </a>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                    className="md:w-1/2 flex justify-center"
                >
                    <div className="relative w-[400px] h-[260px] md:w-[480px] md:h-[300px] bg-gradient-to-br from-blue-50 to-white-50 rounded-3xl shadow-xl overflow-hidden flex items-center justify-center">
                        <Image
                            src="/dashboard-preview.png"
                            alt="Dashboard Preview"
                            width={500}
                            height={300}
                            className="object-cover rounded-2xl"
                        />
                    </div>
                </motion.div>
            </section>

            {/* ===== Features Section ===== */}
            <section
                id="features"
                className="mt-28 flex flex-col justify-center items-center text-center px-10 md:px-20 py-20 "
            >
                <h2 className="text-4xl font-bold text-blue-700 mb-16 tracking-tight">
                    Core Features
                </h2>

                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-auto">
                    {[
                        {
                            icon: <Database className="w-8 h-8 text-blue-600" />,
                            title: "Dynamic Content Builder",
                            desc: "Easily create custom content types without writing code.",
                        },
                        {
                            icon: <Shield className="w-8 h-8 text-blue-600" />,
                            title: "Access Management",
                            desc: "Set detailed permissions for teams and roles.",
                        },
                        {
                            icon: <Globe className="w-8 h-8 text-blue-600" />,
                            title: "API & SEO Integration",
                            desc: "Integrate seamlessly and boost your site’s visibility.",
                        },
                        {
                            icon: <Settings className="w-8 h-8 text-blue-600" />,
                            title: "High Performance",
                            desc: "Enjoy blazing-fast performance and scalability.",
                        },
                    ].map((f, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            className="bg-white border border-blue-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all"
                        >
                            <div className="w-16 h-16 bg-blue-50 flex items-center justify-center mx-auto rounded-full mb-5">
                                {f.icon}
                            </div>
                            <h3 className="font-semibold text-lg text-slate-800 mb-2">{f.title}</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ===== About Section ===== */}
            <section id="about" className="text-center py-28 px-8 md:px-20 bg-white rounded-t-[2rem]">
                <h2 className="text-4xl font-bold text-slate-900 mb-6">
                    About <span className="text-blue-700">CMS Team 3</span>
                </h2>
                <p className="max-w-3xl mx-auto text-slate-600 leading-relaxed mb-20">
                    We build modern and user-friendly CMS systems to make managing content effortless.
                    Our mission is to empower teams to collaborate and publish faster with technology that adapts to their workflow.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-12 py-12">
                    <div className="md:w-1/3 bg-blue-100 rounded-2xl w-full h-56 shadow-inner" />
                    <div className="md:w-1/2 space-y-10 text-left">
                        <div>
                            <h4 className="text-2xl font-semibold text-slate-900 mb-3">Our Mission</h4>
                            <p className="text-slate-600 leading-relaxed">
                                To empower teams through an intuitive CMS that combines simplicity, security, and scalability.
                                We help users focus on creativity while our technology handles the complexity.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-2xl font-semibold text-slate-900 mb-3">Our Values</h4>
                            <p className="text-slate-600 leading-relaxed">
                                We believe in innovation, transparency, and continuous growth.
                                Every feature is built with care to support collaboration and deliver consistent, high-quality digital experiences.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ===== Team Section ===== */}
                <div className="mt-28">
                    <h3 className="text-center text-3xl font-bold text-slate-900 mb-14">Our Awesome Team</h3>
                    <div className="max-w-7xl mx-auto px-6 md:px-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                            {[
                                { name: "Eunike Febianti", role: "Lead / Backend Dev / QA", img: "/team/eunike.png" },
                                { name: "Nadila Yanuarika", role: "Backend Dev / QA", img: "/team/nadila.png" },
                                { name: "Salsabilla Permata", role: "UI/UX Designer / Frontend Dev", img: "/team/salsa.png" },
                                { name: "Adinda Talia", role: "Frontend Dev", img: "/team/adinda.png" },
                                { name: "Amanda Aurelia", role: "Frontend Dev", img: "/team/amanda.png" },
                            ].map((member, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.05 }}
                                    // Langkah 1: Tambah padding p-4 dan hapus overflow-hidden
                                    className="text-center bg-white p-4 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-blue-100 hover:border-blue-400"
                                >
                                    {/* Langkah 2: Tambah rounded-xl di sini */}
                                    <div className="h-[160px] w-full overflow-hidden rounded-xl">
                                        <Image
                                            src={member.img}
                                            alt={member.name}
                                            width={400}
                                            height={400}
                                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Langkah 3: Ubah p-5 menjadi pt-5 untuk jarak atas saja */}
                                    <div className="pt-3">
                                        <h4 className="font-semibold text-slate-900 text-lg">{member.name}</h4>
                                        <p className="text-sm text-slate-500">{member.role}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== Footer ===== */}
            <section
                id="contact">
                <footer className=" border-blue-100 text-slate-700"
                    style={{
                        background: "linear-gradient(to bottom, #ffffff 0%, #ebf3ff 40%, #dbeafe 70%, #bfdbfe 100%)",
                    }}>
                    <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">

                        {/* Logo & About */}
                        <div>
                            <h2 className="text-2xl font-bold text-blue-700 mb-3">CMS Team 3</h2>
                            <p className="text-sm text-slate-600 leading-relaxed text-justify">
                                Kami adalah tim pengembang yang <br />berfokus pada solusi digital modern <br />
                                untuk membantu pengelolaan konten <br /> lebih efisien, aman, dan inovatif.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Quick Links</h3>
                            <ul className="space-y-2 text-sm">
                                <li><a href="/landing" className="hover:text-blue-600 transition">Home</a></li>
                                <li><a href="/landing#about" className="hover:text-blue-600 transition">About Us</a></li>
                                <li><a href="/landing#features" className="hover:text-blue-600 transition">Features</a></li>
                                <li><a href="/landing#contact" className="hover:text-blue-600 transition">Contact</a></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Contact Us</h3>
                            <ul className="text-sm space-y-2">
                                <li><span className="font-medium">Email:</span> team3cms@gmail.com</li>
                                <li><span className="font-medium">Phone:</span> +62 812 3456 7890</li>
                                <li><span className="font-medium">Address:</span> Universitas Brawijaya, Malang</li>
                            </ul>
                        </div>

                        {/* Social Media */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Follow Us</h3>
                            <div className="flex gap-4 text-blue-600">
                                <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-blue-800 transition"
                                >
                                    <Facebook className="w-5 h-5" />
                                </a>
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-pink-600 transition"
                                >
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a
                                    href="https://twitter.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-sky-500 transition"
                                >
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a
                                    href="https://linkedin.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-blue-700 transition"
                                >
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Copyright */}
                    <div className="text-center border-t border-blue-100 py-5 text-slate-500 text-sm">
                        © {new Date().getFullYear()} <span className="font-medium text-blue-700">CMS Team 3</span>. All rights reserved.
                    </div>
                </footer>
            </section>
        </div>
    );
}