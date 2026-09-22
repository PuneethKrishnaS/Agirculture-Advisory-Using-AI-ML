import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';
import { API_BASE_URL } from '../config';
import { usePlotContext } from '../contexts/PlotContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Simple SVG Icons for Shadcn style
const CloudRain = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>;
const Sun = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>;

const MainDashboard = () => {
  const { activePlot, history } = usePlotContext();

  const [summary, setSummary] = useState({
    latest_plot: { location: "Loading...", npk: "--", status: "--" },
    total_plots_managed: 0,
    average_npk: "--",
    weather: { 
      temp: "--", condition: "--", rain_chance: "--", hourly: [],
      humidity: "--", wind_speed: "--", cloud_cover: "--", uv_index: "--", et0: "--",
      soil_temp: "--", forecast24: []
    },
    moisture_trend: [50, 50, 50, 50, 50, 50, 50]
  });

  // Derived state from active plot
  const currentPlotLocation = activePlot?.location || activePlot?.name || activePlot?.formData?.plotName || "No Plot Selected";
  const currentPlotNpk = activePlot?.formData ? `${activePlot.formData.nitrogen}:${activePlot.formData.phosphorus}:${activePlot.formData.potassium}` : "--";
  const currentPlotStatus = activePlot?.status || "Unknown";
  const totalPlots = history?.length || 0;

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user ? user.id : '';

    fetch(`${API_BASE_URL}/api/dashboard_summary?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        if(data) {
          setSummary(prev => ({
            ...prev,
            total_plots_managed: data.total_plots_managed || prev.total_plots_managed,
            average_npk: data.average_npk || prev.average_npk
          }));
        }
      })
      .catch(err => console.error("Error fetching summary:", err));
  }, []);

  useEffect(() => {
    if (activePlot && activePlot.formData) {
      const lat = activePlot.formData.latitude;
      const lng = activePlot.formData.longitude;

      if (lat && lng) {
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,cloud_cover&hourly=temperature_2m,precipitation_probability,soil_temperature_0_to_7cm,soil_moisture_0_to_7cm,uv_index,et0_fao_evapotranspiration&past_days=7&forecast_days=2`)
          .then(r => r.json())
          .then(data => {
            if(data && data.current) {
              const temp = Math.round(data.current.temperature_2m);
              const rain = data.current.precipitation > 0 ? 'Rain' : 'Clear';
              
              const humidity = data.current.relative_humidity_2m;
              const wind_speed = data.current.wind_speed_10m;
              const cloud_cover = data.current.cloud_cover;

              const now = new Date();
              const startIndex = data.hourly?.time?.findIndex(t => new Date(t) >= now) || 0;
              const safeIdx = Math.max(0, startIndex);
              
              const rain_chance = data.hourly?.precipitation_probability ? data.hourly.precipitation_probability[safeIdx] || 0 : 0;
              const uv_index = data.hourly?.uv_index ? data.hourly.uv_index[safeIdx] || 0 : 0;
              const et0 = data.hourly?.et0_fao_evapotranspiration ? data.hourly.et0_fao_evapotranspiration[safeIdx] || 0 : 0;
              const soil_temp = data.hourly?.soil_temperature_0_to_7cm ? data.hourly.soil_temperature_0_to_7cm[safeIdx] || 0 : 0;

              const forecast24 = [];
              if (data.hourly && data.hourly.time) {
                for (let i = 0; i < 24; i++) {
                   const idx = safeIdx + i;
                   if (idx >= data.hourly.time.length) break;
                   const timeStr = data.hourly.time[idx];
                   const hourLabel = new Date(timeStr).toLocaleTimeString([], { hour: 'numeric', hour12: true });
                   forecast24.push({
                     time: hourLabel,
                     temp: data.hourly.temperature_2m ? Math.round(data.hourly.temperature_2m[idx]) : 0,
                     rain: data.hourly.precipitation_probability ? data.hourly.precipitation_probability[idx] : 0
                   });
                }
              }
              
              setSummary(prev => ({
                ...prev,
                weather: { temp, condition: rain, rain_chance, hourly: [], humidity, wind_speed, cloud_cover, uv_index, et0, soil_temp, forecast24 }
              }));

              if (data.hourly?.soil_moisture_0_to_7cm) {
                const trend = data.hourly.soil_moisture_0_to_7cm
                  .filter((v, i) => i % 24 === 12)
                  .slice(-7)
                  .map(v => Math.round(v * 100));

                if (trend.length === 7) {
                  setSummary(prev => ({
                    ...prev,
                    moisture_trend: trend
                  }));
                }
              }
            }
          }).catch(err => console.error(err));
      }
    }
  }, [activePlot]);

  return (
    <div className="bg-background text-foreground min-h-screen pb-32 w-full font-sans">
      <TopAppBar />

      <main className="pt-24 px-4 md:px-8 w-full space-y-8">
        {/* Header Section */}
        <section className="mb-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-sm font-bold text-primary uppercase tracking-widest">Control Center</span>
              <h2 className="text-4xl font-extrabold text-foreground mt-2 tracking-tight">Dashboard Overview</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mt-4">
                Manage your fields and monitor vital metrics.
              </p>
            </div>
            <Button asChild size="lg">
              <Link to="/input">Manage Plots</Link>
            </Button>
          </div>
        </section>

        {/* Hero Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 relative overflow-hidden bg-primary/5">
            <CardContent className="p-6 relative z-10">
              <Badge className="mb-4">Active Plot</Badge>
              <h2 className="text-3xl font-bold mb-4">{currentPlotLocation}</h2>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-background/50 rounded-md border p-2 text-sm">
                  <span className="font-semibold text-muted-foreground">Latest NPK:</span>
                  <span>{currentPlotNpk}</span>
                </div>
                <div className="flex items-center gap-2 bg-background/50 rounded-md border p-2 text-sm">
                  <span className="font-semibold text-muted-foreground">Status:</span>
                  <span>{currentPlotStatus}</span>
                </div>
                <div className="flex items-center gap-2 bg-background/50 rounded-md border p-2 text-sm">
                  <span className="font-semibold text-muted-foreground">Total Plots:</span>
                  <span>{totalPlots}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Link to="/input" className="flex flex-col items-center justify-center rounded-xl border bg-card text-card-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors p-4">
              <span className="material-symbols-outlined text-3xl mb-2 text-muted-foreground">edit_document</span>
              <span className="font-medium">Data Entry</span>
            </Link>
            <Link to="/advisory" className="flex flex-col items-center justify-center rounded-xl border bg-card text-card-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors p-4">
              <span className="material-symbols-outlined text-3xl mb-2 text-primary">psychology</span>
              <span className="font-medium">AI Advisory</span>
            </Link>
            <Link to="/reports" className="flex flex-col items-center justify-center rounded-xl border bg-card text-card-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors p-4">
              <span className="material-symbols-outlined text-3xl mb-2 text-muted-foreground">analytics</span>
              <span className="font-medium">Reports</span>
            </Link>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weather Insights */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Weather Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl font-bold">{summary.weather.temp}°</div>
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    {summary.weather.condition === 'Clear' ? <Sun /> : <CloudRain />}
                    {summary.weather.condition}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Rain chance: {summary.weather.rain_chance}%</div>
                </div>
              </div>
              <div className="h-48 w-full mt-4">
                {summary.weather.forecast24 && summary.weather.forecast24.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={summary.weather.forecast24} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                      <XAxis dataKey="time" tick={{fontSize: 10}} tickMargin={10} minTickGap={20} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}°`} />
                      <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area yAxisId="left" type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
                      <Area yAxisId="right" type="monotone" dataKey="rain" name="Rain Chance (%)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRain)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-lg">Loading forecast...</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Telemetry Grid */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Live Telemetry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border bg-muted/50 flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-primary mb-2">water_drop</span>
                  <p className="text-xs text-muted-foreground mb-1">Humidity</p>
                  <p className="text-lg font-semibold">{summary.weather.humidity}%</p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/50 flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-blue-500 mb-2">air</span>
                  <p className="text-xs text-muted-foreground mb-1">Wind Speed</p>
                  <p className="text-lg font-semibold">{summary.weather.wind_speed} km/h</p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/50 flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-orange-500 mb-2">routine</span>
                  <p className="text-xs text-muted-foreground mb-1">Evapotransp.</p>
                  <p className="text-lg font-semibold">{summary.weather.et0} mm</p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/50 flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-yellow-500 mb-2">wb_sunny</span>
                  <p className="text-xs text-muted-foreground mb-1">UV Index</p>
                  <p className="text-lg font-semibold">{summary.weather.uv_index}</p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/50 flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-amber-700 mb-2">thermostat</span>
                  <p className="text-xs text-muted-foreground mb-1">Soil Temp</p>
                  <p className="text-lg font-semibold">{summary.weather.soil_temp}°C</p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/50 flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-slate-500 mb-2">filter_drama</span>
                  <p className="text-xs text-muted-foreground mb-1">Cloud Cover</p>
                  <p className="text-lg font-semibold">{summary.weather.cloud_cover}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </main>
      <BottomNavBar />
    </div>
  );
};

export default MainDashboard;
