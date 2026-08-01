import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';
import { usePlotContext } from '../contexts/PlotContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  LineChart, Line, ScatterChart, Scatter, PieChart, Pie, Cell, Legend 
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const Reports = () => {
  const { history, activePlot } = usePlotContext();

  // ----- KPI CALCULATIONS -----
  const totalYield = history.reduce((sum, plot) => sum + (Number(plot.formData?.yieldLastSeason) || 0), 0);
  const avgYield = history.length > 0 ? (totalYield / history.length).toFixed(2) : 0;

  // Calculate Average Health Score
  const getHealthScore = (formData) => {
    let score = 100;
    const ph = Number(formData?.ph || 7);
    if (ph < 5.5 || ph > 8.0) score -= 15;
    else if (ph < 6.0 || ph > 7.5) score -= 5;
    const ec = Number(formData?.electricalConductivity || 0);
    if (ec > 2.5) score -= 10;
    const moisture = Number(formData?.moisture || 50);
    if (moisture < 40 || moisture > 80) score -= 10;
    return Math.max(0, score);
  };
  const totalHealth = history.reduce((sum, p) => sum + getHealthScore(p.formData), 0);
  const avgHealth = history.length > 0 ? Math.round(totalHealth / history.length) : 0;

  // Most Successful Crop
  const cropStats = {};
  history.forEach(p => {
    const crop = p.formData?.cropType || 'Unknown';
    if (!cropStats[crop]) cropStats[crop] = { totalYield: 0, count: 0 };
    cropStats[crop].totalYield += Number(p.formData?.yieldLastSeason || 0);
    cropStats[crop].count += 1;
  });
  let bestCrop = "N/A";
  let maxCropYield = -1;
  Object.keys(cropStats).forEach(c => {
    if (cropStats[c].totalYield > maxCropYield) {
      maxCropYield = cropStats[c].totalYield;
      bestCrop = c;
    }
  });

  // Resource Efficiency
  let efficiency = 92;
  if (activePlot?.formData) {
    const area = Number(activePlot.formData.fieldArea) || 1;
    const fert = Number(activePlot.formData.fertilizerLastSeason) || 0;
    const ratio = fert / area; 
    if (ratio > 100) efficiency = 75; 
    else if (ratio < 20) efficiency = 80; 
    else efficiency = 95;
  }

  // Alerts
  const criticalAlerts = history.filter(p => {
    const n = Number(p.formData?.nitrogen);
    const m = Number(p.formData?.moisture);
    return n < 15 || m < 30;
  }).length;

  // ----- CHART DATA -----
  // 1. Yield Timeline Data
  const yieldTimelineData = history.map((p, idx) => ({
    name: p.name || p.location.substring(0, 15),
    Yield: Number(p.formData?.yieldLastSeason) || 0,
    Plot: p.name || p.location
  }));

  // 2. Crop Distribution Data
  const cropPieData = Object.keys(cropStats).map(c => ({
    name: c,
    value: cropStats[c].count
  }));

  // 3. Yield vs Fertilizer
  const scatterData = history.map(p => ({
    name: p.name || p.location,
    Fertilizer: Number(p.formData?.fertilizerLastSeason) || 0,
    Yield: Number(p.formData?.yieldLastSeason) || 0,
    Crop: p.formData?.cropType || 'Unknown'
  }));

  // ----- EXPORT -----
  const exportCSV = () => {
    if (!history.length) return;
    const headers = ["Plot Name", "Crop", "Yield (Tons)", "Fertilizer (kg)", "Nitrogen", "Phosphorus", "Potassium", "pH", "Moisture", "Temperature", "Rainfall"];
    const rows = history.map(p => [
      `"${p.name || p.location}"`,
      `"${p.formData?.cropType || "-"}"`,
      p.formData?.yieldLastSeason || 0,
      p.formData?.fertilizerLastSeason || 0,
      p.formData?.nitrogen || 0,
      p.formData?.phosphorus || 0,
      p.formData?.potassium || 0,
      p.formData?.ph || 0,
      p.formData?.moisture || 0,
      p.formData?.temperature || 0,
      p.formData?.rainfall || 0
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "farm_detailed_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#f8fafc] text-on-surface min-h-screen pb-32 font-sans print:bg-white print:pb-0">
      <div className="print:hidden">
        <TopAppBar />
      </div>

      <main className="w-full px-4 md:px-8 pt-24 print:pt-0">
        {/* Header & Filters */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 print:mb-4">
          <div>
            <span className="text-sm font-bold text-primary uppercase tracking-widest">Farm Analytics</span>
            <h2 className="text-4xl font-extrabold text-foreground mt-2 tracking-tight">Detailed Audit Report</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
              Comprehensive data breakdown of historical yields, environmental trends, and resource efficiency across all your recorded plots.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <button onClick={exportCSV} className="flex items-center gap-2 bg-white border border-outline-variant/30 text-primary font-bold px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors shadow-sm">
              <span className="material-symbols-outlined">download</span> Export CSV
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-lg hover:brightness-110 transition-colors shadow-sm">
              <span className="material-symbols-outlined">print</span> Print Report
            </button>
          </div>
        </section>

        {/* Enhanced KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 print:mb-6">
          <div className="bg-white rounded-2xl p-6 border border-outline-variant/20 border-t-4 border-t-primary">
            <div className="flex justify-between items-start mb-2">
              <span className="text-label-lg font-bold text-on-surface-variant uppercase tracking-wider">Avg Yield / Plot</span>
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">query_stats</span>
            </div>
            <div className="text-4xl font-black text-on-surface">{avgYield} <span className="text-xl font-bold text-on-surface-variant">Tons</span></div>
            <div className="text-label-md text-on-surface-variant mt-2">Across {history.length} active plots</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-outline-variant/20 border-t-4 border-t-tertiary">
            <div className="flex justify-between items-start mb-2">
              <span className="text-label-lg font-bold text-on-surface-variant uppercase tracking-wider">Avg Soil Health</span>
              <span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-full">eco</span>
            </div>
            <div className="text-4xl font-black text-on-surface">{avgHealth}<span className="text-xl font-bold text-on-surface-variant">/100</span></div>
            <div className="text-label-md text-on-surface-variant mt-2">{avgHealth >= 80 ? 'Optimal Conditions' : 'Needs Optimization'}</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-outline-variant/20 border-t-4 border-t-secondary">
            <div className="flex justify-between items-start mb-2">
              <span className="text-label-lg font-bold text-on-surface-variant uppercase tracking-wider">Top Performing Crop</span>
              <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-full">emoji_events</span>
            </div>
            <div className="text-4xl font-black text-on-surface capitalize">{bestCrop}</div>
            <div className="text-label-md text-on-surface-variant mt-2">Highest historical yield volume</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-outline-variant/20 border-t-4 border-t-error">
            <div className="flex justify-between items-start mb-2">
              <span className="text-label-lg font-bold text-on-surface-variant uppercase tracking-wider">Critical Alerts</span>
              <span className="material-symbols-outlined text-error bg-error/10 p-2 rounded-full">warning</span>
            </div>
            <div className="text-4xl font-black text-on-surface">{criticalAlerts}</div>
            <div className="text-label-md text-error font-bold mt-2">Plots require immediate attention</div>
          </div>
        </section>

        {/* Analytics Charts Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 print:mb-8 break-inside-avoid">
          {/* Yield Timeline Chart */}
          <div className="bg-white rounded-2xl border border-outline-variant/20 p-6 flex flex-col h-[400px]">
            <h3 className="text-xl font-bold text-on-surface mb-2">Yield Production by Plot</h3>
            <p className="text-body-sm text-on-surface-variant mb-6">Historical harvest tonnage across all registered farm locations.</p>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yieldTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="Yield" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fertilizer vs Yield Scatter */}
          <div className="bg-white rounded-2xl border border-outline-variant/20 p-6 flex flex-col h-[400px]">
            <h3 className="text-xl font-bold text-on-surface mb-2">Resource Efficiency (Fertilizer vs Yield)</h3>
            <p className="text-body-sm text-on-surface-variant mb-6">Analyzing the impact of fertilizer volume on final harvest yield.</p>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" dataKey="Fertilizer" name="Fertilizer (kg)" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis type="number" dataKey="Yield" name="Yield (Tons)" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Scatter name="Plots" data={scatterData} fill="#3b82f6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Second Row of Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 print:mb-8 break-inside-avoid">
          {/* Crop Distribution Pie */}
          <div className="col-span-1 bg-white rounded-2xl border border-outline-variant/20 p-6 flex flex-col h-[350px]">
            <h3 className="text-xl font-bold text-on-surface mb-2">Crop Distribution</h3>
            <p className="text-body-sm text-on-surface-variant mb-6">Frequency of crops planted historically.</p>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={cropPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {cropPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Environmental Averages (Mockup of line chart) */}
          <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl border border-outline-variant/20 p-6 flex flex-col h-[350px]">
             <h3 className="text-xl font-bold text-on-surface mb-2">Environmental Trends (Rainfall vs Temp)</h3>
             <p className="text-body-sm text-on-surface-variant mb-6">Weather conditions across your historical plots.</p>
             <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history.map(p => ({name: p.name || p.location.substring(0,10), Temp: Number(p.formData?.temperature||0), Rain: Number(p.formData?.rainfall||0)}))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="Temp" name="Temp (°C)" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  <Line yAxisId="right" type="monotone" dataKey="Rain" name="Rainfall (mm)" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
             </div>
          </div>
        </section>

        {/* Detailed Data Table */}
        <section className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden mb-12">
          <div className="p-6 border-b border-outline-variant/20 bg-slate-50/50">
            <h3 className="text-2xl font-bold text-on-surface">Historical Plot Data</h3>
            <p className="text-body-md text-on-surface-variant">Detailed raw telemetry and results for all saved plots.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-label-md uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-outline-variant/20 whitespace-nowrap">Plot Name</th>
                  <th className="p-4 font-bold border-b border-outline-variant/20 whitespace-nowrap">Crop</th>
                  <th className="p-4 font-bold border-b border-outline-variant/20 whitespace-nowrap">Yield (T)</th>
                  <th className="p-4 font-bold border-b border-outline-variant/20 whitespace-nowrap">NPK Ratio</th>
                  <th className="p-4 font-bold border-b border-outline-variant/20 whitespace-nowrap">pH</th>
                  <th className="p-4 font-bold border-b border-outline-variant/20 whitespace-nowrap">Temp (°C)</th>
                  <th className="p-4 font-bold border-b border-outline-variant/20 whitespace-nowrap">Rainfall (mm)</th>
                  <th className="p-4 font-bold border-b border-outline-variant/20 whitespace-nowrap">Health</th>
                </tr>
              </thead>
              <tbody className="text-body-md text-on-surface">
                {history.length > 0 ? history.map((plot, idx) => {
                  const f = plot.formData || {};
                  const health = getHealthScore(f);
                  return (
                    <tr key={idx} className="hover:bg-primary/5 transition-colors border-b border-outline-variant/10 last:border-0">
                      <td className="p-4 font-bold">{plot.name || plot.location}</td>
                      <td className="p-4 capitalize">{f.cropType || '-'}</td>
                      <td className="p-4 font-bold text-primary">{f.yieldLastSeason || '-'}</td>
                      <td className="p-4">{f.nitrogen || 0}:{f.phosphorus || 0}:{f.potassium || 0}</td>
                      <td className="p-4">{f.ph || '-'}</td>
                      <td className="p-4">{f.temperature || '-'}</td>
                      <td className="p-4">{f.rainfall || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${health >= 80 ? 'bg-primary-container text-on-primary-container' : health >= 60 ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-error-container text-on-error-container'}`}>
                          {health}/100
                        </span>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-on-surface-variant italic">No historical data available. Please save a plot first.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
      <div className="print:hidden">
        <BottomNavBar />
      </div>
    </div>
  );
};

export default Reports;
