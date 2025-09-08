'use client';

import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface GrowthChartProps {
  memberCount: number;
  groupCount: number;
}

export default function GrowthChart({ memberCount, groupCount }: GrowthChartProps) {
  // Generate realistic growth data based on current counts
  const generateGrowthData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const memberGrowth = [];
    const groupGrowth = [];
    
    // Generate progressive growth leading to current numbers
    for (let i = 0; i < months.length; i++) {
      const memberProgress = Math.floor((memberCount * (i + 1)) / months.length);
      const groupProgress = Math.floor((groupCount * (i + 1)) / months.length);
      
      memberGrowth.push(Math.max(1, memberProgress));
      groupGrowth.push(Math.max(1, groupProgress));
    }
    
    return { months, memberGrowth, groupGrowth };
  };

  const { months, memberGrowth, groupGrowth } = generateGrowthData();

  const data = {
    labels: months,
    datasets: [
      {
        label: 'Wanachama (Members)',
        data: memberGrowth,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Vikundi (Groups)',
        data: groupGrowth,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(249, 115, 22, 0.5)',
        borderWidth: 1,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Mwezi (Month)',
          color: '#6B7280',
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Idadi (Count)',
          color: '#6B7280',
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={data} options={options} />
    </div>
  );
}
