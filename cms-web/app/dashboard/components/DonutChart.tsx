// src/components/DonutChart.tsx
"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  Plugin
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DonutChart() {
  const total = 208;

  const data = {
    labels: ["Upcoming", "Overdue", "On track"],
    datasets: [
      {
        data: [60, 10, 138],
        backgroundColor: ["#2dd4bf", "#7c3aed", "#2563eb"],
        hoverOffset: 6,
        cutout: "70%"
      }
    ]
  };

  // Plugin custom untuk text di tengah
  const centerText: Plugin<"doughnut"> = {
    id: "centerText",
    beforeDraw: (chart) => {
      const { ctx, chartArea } = chart;
      const xCenter = (chartArea.left + chartArea.right) / 2;
      const yCenter = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();
      ctx.font = "bold 20px sans-serif";
      ctx.fillStyle = "#1e293b"; // slate-800
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(total.toString(), xCenter, yCenter);
      ctx.restore();
    }
  };

  const options: ChartOptions<"doughnut"> = {
    plugins: {
      legend: { display: true, position: "right" }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="h-72 relative">
      <Doughnut data={data} options={options} plugins={[centerText]} />
    </div>
  );
}
