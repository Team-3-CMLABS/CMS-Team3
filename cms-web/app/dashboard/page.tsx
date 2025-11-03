"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatCard from "@/components/StatCard";
import DonutChart from "@/components/DonutChart";
import BarChart from "@/components/BarChart";
import { Clock, FileText, Users } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  interface Collaborator {
    id: number;
    name: string;
    email?: string;
    posisi?: string;
    status?: string;
  }

  interface Project {
    id: number;
    name: string;
    status?: string;
    last_update?: string;
    collaborators?: Collaborator[];
  }

  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    } else {
      setAuthorized(true);
    }

    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/projects");
        const result = await res.json();

        setProjects(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error("Gagal mengambil data project:", err);
        setProjects([]);
      }
    };

    fetchProjects();
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

      {/* === ACTIVITY & ORGANIZATION === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recently Activity */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Recently Activity
            </h2>
            <span className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer transition">
              View all
            </span>
          </div>
          <ul className="divide-y divide-slate-100">
            {activities.map((act, i) => (
              <li
                key={i}
                className="flex items-start justify-between py-3 hover:bg-slate-50/70 rounded-lg px-2 transition-all duration-200"
              >
                <div className="flex items-start gap-3 text-sm text-slate-700">
                  <div className="flex-shrink-0 mt-[2px]">{act.icon}</div>
                  <p
                    className="leading-snug"
                    dangerouslySetInnerHTML={{ __html: act.text }}
                  />
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {act.time}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              List Project
            </h2>
            <span
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer transition"
              onClick={() => router.push("/projects")}
            >
              Manage
            </span>
          </div>
          <ul className="divide-y divide-slate-100">
            {projects.length > 0 ? (
              projects.map((proj) => (
                <li
                  key={proj.id}
                  className="flex justify-between items-center py-3 px-2 hover:bg-slate-50/70 rounded-lg transition-all duration-200"
                >
                  <div>
                    <p className="font-medium text-slate-800">{proj.name || "-"}</p>
                    <p className="text-xs text-slate-500">
                      {proj.collaborators?.length || 0} collaborators
                    </p>
                  </div>
                  <button
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                    onClick={() => router.push(`/projects/detail-projects?id=${proj.id}`)}
                  >
                    View →
                  </button>
                </li>
              ))
            ) : (
              <li className="text-center text-sm text-gray-400 py-3">
                No projects available
              </li>
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}
