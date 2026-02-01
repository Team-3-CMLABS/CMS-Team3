// src/components/BarChart.tsx
"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart() {
  const data = {
    labels: ["Sep 1", "Sep 2", "Sep 3", "Sep 4", "Sep 5", "Sep 6", "Sep 7", "Sep 8", "Sep 9"],
    datasets: [
      { label: "Commits", data: [9, 7, 6, 8, 6, 5, 6, 9, 10], backgroundColor: "#6b46c1" },
      { label: "Tasks Completed", data: [8, 7, 5, 7, 4, 5, 5, 8, 9], backgroundColor: "#2dd4bf" }
    ]
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 2,
        },
      },
    },
  };

  return (
    <div style={{ height: 320 }}>
      <Bar data={data} options={options} />
    </div>
  );
}
