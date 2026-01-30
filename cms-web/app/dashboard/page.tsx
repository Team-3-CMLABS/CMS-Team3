"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatCard from "./components/StatCard";
import DonutChart from "./components/DonutChart";
import BarChart from "./components/BarChart";
import { Clock, FileText, Users } from "lucide-react";

interface Content {
  id: number;
  model: string;
  slug: string;
  status: string;
  editor_email?: string;
}

interface Collaborator {
  id: number;
  user_id: number;
  name: string;
  email: string;
  role?: string;
  posisi?: string;
  status?: string;
  models?: any[];
}

export default function Dashboard() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [role, setRole] = useState<string>("");

  const [content, setContent] = useState<Content[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const totalCollaborators = collaborators.length;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) {
      router.replace("/login");
      return;
    }

    setAuthorized(true);
    setRole(user.role);

    const fetchDashboardData = async () => {
      try {
        const [contentRes, collabRes] = await Promise.all([
          fetch("http://localhost:4000/api/content", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:4000/api/collaborators/all-users", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!contentRes.ok || !collabRes.ok) {
          throw new Error("Response API tidak OK");
        }

        const contentJson = await contentRes.json();
        const collabJson = await collabRes.json();

        setContent(
          Array.isArray(contentJson?.contents)
            ? contentJson.contents
            : []
        );

        setCollaborators(
          Array.isArray(collabJson?.data)
            ? collabJson.data
            : []
        );
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        setContent([]);
        setCollaborators([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (!authorized) {
    return <p className="text-center mt-10">Loading...</p>;
  }

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

  // hanya collaborator dengan role admin
  const adminCollaborators = collaborators.filter(
    (c) => c.role === "admin"
  );

  return (
    <main className="space-y-8 animate-fadeIn">
      {/* === TOP STATS === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Content Model"
          value={loading ? "..." : content.length}
          color="indigo"
        />

        <StatCard
          title="Collaborator"
          value={
            loading
              ? "..."
              : role === "admin"
                ? totalCollaborators
                : "-"
          }
          color="purple"
        />

        <StatCard
          title="Published Content"
          value={
            loading
              ? "..."
              : content.filter((c) => c.status === "published").length
          }
          color="blue"
        />

        <StatCard
          title="Draft Content"
          value={
            loading
              ? "..."
              : content.filter((c) => c.status === "draft").length
          }
          color="teal"
        />
      </div>

      {/* === CHARTS === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 border shadow-sm">
          <DonutChart />
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border shadow-sm">
          <BarChart />
        </div>
      </div>

      {/* === ACTIVITY & CONTENT === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ACTIVITY */}
        <div className="bg-white rounded-2xl border shadow-sm p-4">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Activity
          </h2>

          <ul className="space-y-2">
            {activities.map((act, i) => (
              <li
                key={i}
                className="flex gap-3 p-2 rounded-lg border hover:bg-slate-50"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-md">
                  {act.icon}
                </div>
                <div className="text-xs">
                  <p dangerouslySetInnerHTML={{ __html: act.text }} />
                  <span className="text-slate-400">{act.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* CONTENT LIST */}
        <div className="bg-white rounded-2xl border shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              List Content
            </h2>

            {role !== "viewer" && (
              <span
                onClick={() => router.push("/content")}
                className="text-xs text-blue-600 cursor-pointer"
              >
                Manage →
              </span>
            )}
          </div>

          <ul className="space-y-2">
            {content.length > 0 ? (
              content.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center p-2 rounded-lg border hover:bg-blue-50"
                >
                  <div>
                    <p className="text-sm font-medium">{item.model}</p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${item.status === "published"
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
                      className="text-[11px] px-3 py-1 bg-blue-600 text-white rounded-full"
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

    </main>
  );
}