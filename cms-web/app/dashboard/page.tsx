"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatCard from "./components/StatCard";
import DonutChart from "./components/DonutChart";
import BarChart from "./components/BarChart";
import { Clock, FileText, Users } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [role, setRole] = useState<string>("");

  interface Content {
    id: number;
    model: string;
    slug: string;
    status: string;
    editor_email?: string;
  }

  const [content, setContent] = useState<Content[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) {
      router.replace("/login");
      return;
    } else {
      setAuthorized(true);
      setRole(user.role);
    }

    const fetchContent = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/content", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        console.log("CONTENT RESPONSE:", result);

        setContent(Array.isArray(result?.contents) ? result.contents : []);
      } catch (err) {
        console.error("Gagal mengambil data content:", err);
        setContent([]);
      }
    };

    fetchContent();
  }, [router]);

  if (!authorized) return <p className="text-center mt-10">Loading...</p>;

  const activities = [
    {
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      text: "Created new single page <b>About Us</b>",
      time: "5 mins ago",
    },
    {
      icon: <FileText className="w-4 h-4 text-green-500" />,
      text: "Edited layout for <b>Portfolio Page</b>",
      time: "20 mins ago",
    },
    {
      icon: <Users className="w-4 h-4 text-purple-500" />,
      text: "Added collaborator to <b>Company Profile</b>",
      time: "1 hour ago",
    },
    {
      icon: <FileText className="w-4 h-4 text-indigo-500" />,
      text: "Updated project <b>Landing Page Redesign</b>",
      time: "2 hours ago",
    },
    {
      icon: <FileText className="w-4 h-4 text-orange-500" />,
      text: "Published new blog post <b>UI Trends 2025</b>",
      time: "Yesterday",
    },
  ];

  return (
    <main className="space-y-8 animate-fadeIn">
      {/* === TOP STATS === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Personal Project" value="217" color="blue" />
        <StatCard title="Organization Project" value="235" color="teal" />
        <StatCard title="Total Organization" value="148" color="indigo" />
        <StatCard title="Collaborator" value="102" color="purple" />
      </div>

      {/* === CHARTS === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm hover:shadow-md transition-all duration-200">
          <DonutChart />
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm hover:shadow-md transition-all duration-200">
          <BarChart />
        </div>
      </div>

      {/* === ACTIVITY & CONTENT === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recently Activity */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-slate-500" />
              Recently Activity
            </h2>
            <span className="text-xs text-slate-400 hover:text-blue-600 cursor-pointer transition">
              View all →
            </span>
          </div>

          <ul className="space-y-1.5">
            {activities.map((act, i) => (
              <li
                key={i}
                className="group flex items-start gap-3 p-2.5 rounded-lg
                     border border-slate-100
                     hover:bg-slate-50 hover:border-blue-200
                     transition-all duration-200"
              >
                {/* Icon */}
                <div className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-100 group-hover:bg-blue-100">
                  {act.icon}
                </div>

                {/* Text */}
                <div className="flex-1 text-xs text-slate-700">
                  <p
                    dangerouslySetInnerHTML={{ __html: act.text }}
                    className="leading-snug"
                  />
                  <span className="block mt-0.5 text-[11px] text-slate-400">
                    {act.time}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Content List */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-slate-500" />
              List Content
            </h2>
            {role !== "viewer" && (
              <span
                className="text-xs text-slate-400 hover:text-blue-600 cursor-pointer transition"
                onClick={() => router.push("/content")}
              >
                Manage →
              </span>
            )}
          </div>

          <ul className="space-y-1.5">
            {content.length > 0 ? (
              content.map((item) => (
                <li
                  key={item.id}
                  className="group flex justify-between items-center p-2.5 rounded-lg
                       border border-slate-100
                       hover:bg-blue-50/40 hover:border-blue-200
                       transition-all duration-200"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800 leading-tight">
                      {item.model}
                    </p>
                    <span
                      className={`inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full
                ${item.status === "published"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                        }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {role !== "viewer" && (
                    <button
                      onClick={() => router.push(`/content/${item.slug}`)}
                      className="text-[11px] px-3 py-1 rounded-full
         bg-blue-600 text-white
         hover:bg-blue-700 transition"
                    >
                      View →
                    </button>
                  )}
                </li>
              ))
            ) : (
              <li className="text-center text-xs text-slate-400 py-6">
                No content available
              </li>
            )}
          </ul>
        </div>
      </div>
    </main >
  );
}
