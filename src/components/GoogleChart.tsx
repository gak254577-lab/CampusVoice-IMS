/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import Loader from './SkeletonLoader';

interface ChartProps {
  type: 'PieChart' | 'ColumnChart' | 'BarChart' | 'LineChart';
  data: any[][];
  options?: any;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleChart({ type, data, options = {} }: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const renderChart = () => {
      if (!active || !chartRef.current || !window.google || !window.google.visualization) return;

      try {
        const dt = window.google.visualization.arrayToDataTable(data);
        let chart;

        if (type === 'PieChart') {
          chart = new window.google.visualization.PieChart(chartRef.current);
        } else if (type === 'ColumnChart') {
          chart = new window.google.visualization.ColumnChart(chartRef.current);
        } else if (type === 'BarChart') {
          chart = new window.google.visualization.BarChart(chartRef.current);
        } else {
          chart = new window.google.visualization.LineChart(chartRef.current);
        }

        const mergedOptions = {
          backgroundColor: 'transparent',
          legend: { 
            position: 'right', 
            textStyle: { color: '#94A3B8', fontSize: 11, fontFamily: 'DM Sans' } 
          },
          chartArea: { width: '85%', height: '70%', top: 20 },
          colors: ['#4F7FFF', '#A78BFA', '#34D399', '#FB923C', '#EF4444'],
          hAxis: {
            textStyle: { color: '#94A3B8', fontSize: 10, fontFamily: 'DM Sans' },
            gridlines: { color: 'rgba(255,255,255,0.04)' },
            baselineColor: 'rgba(255,255,255,0.08)'
          },
          vAxis: {
            textStyle: { color: '#94A3B8', fontSize: 10, fontFamily: 'DM Sans' },
            gridlines: { color: 'rgba(255,255,255,0.04)' },
            baselineColor: 'rgba(255,255,255,0.08)'
          },
          titleTextStyle: { color: '#FFFFFF', fontName: 'Syne', fontSize: 14 },
          ...options,
        };

        chart.draw(dt, mergedOptions);
        setLoading(false);
      } catch (err) {
        console.error("Google Chart drawing failed:", err);
        setError(true);
      }
    };

    const loadChartsLibrary = () => {
      if (window.google && window.google.charts) {
        if (!window.google.visualization) {
          window.google.charts.load('current', { packages: ['corechart'] });
          window.google.charts.setOnLoadCallback(() => {
            if (active) renderChart();
          });
        } else {
          renderChart();
        }
        return;
      }

      // Append google charts script tag if missing
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/charts/loader.js';
      script.defer = true;
      script.onload = () => {
        if (!active) return;
        window.google.charts.load('current', { packages: ['corechart'] });
        window.google.charts.setOnLoadCallback(() => {
          if (active) renderChart();
        });
      };
      script.onerror = () => {
        if (active) {
          setError(true);
          setLoading(false);
        }
      };
      document.head.appendChild(script);
    };

    loadChartsLibrary();

    // Handle responsiveness
    const handleResize = () => {
      renderChart();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      active = false;
      window.removeEventListener('resize', handleResize);
    };
  }, [data, options, type]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 font-light text-xs">
        <span>Failed to load visual charts graph.</span>
        <span>Please check your network connection.</span>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#161B2A]/50 backdrop-blur-sm z-10">
          <Loader variant="table" className="w-full h-full opacity-40" />
        </div>
      )}
      <div ref={chartRef} className="w-full h-64 min-h-[250px]" />
    </div>
  );
}
