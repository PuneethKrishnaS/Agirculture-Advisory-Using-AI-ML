import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TopAppBar from "../components/TopAppBar";
import BottomNavBar from "../components/BottomNavBar";
import { usePlotContext } from "../contexts/PlotContext";
import { API_BASE_URL } from "../config";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const ShapChart = ({ shapData, title, icon }) => {
    if (!shapData || shapData.length === 0) return null;

    const shapEntries = Array.isArray(shapData) ? shapData.slice(0, 5) : [];
    const chartData = shapEntries.map(([name, val]) => ({
        name: name.replace(/_/g, " "),
        value: Number(val),
    }));

    return (
        <div className="bg-white rounded-xl p-6 border border-outline-variant/20 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-title-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">
                        {icon}
                    </span>
                    {title} Reasoning
                </h3>
                <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-primary-container text-on-primary-container">
                        Pos
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-error-container text-on-error-container">
                        Neg
                    </span>
                </div>
            </div>
            <div className="flex-1 min-h-[200px] w-full">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minWidth={1}
                    minHeight={1}
                >
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={true}
                            vertical={false}
                        />
                        <XAxis type="number" tick={{ fontSize: 12 }} hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tick={{ fontSize: 11 }}
                            width={90}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: "rgba(0,0,0,0.03)" }}
                            formatter={(value) => Number(value).toFixed(4)}
                        />
                        <Bar dataKey="value" radius={4} barSize={20}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        entry.value > 0 ? "#10b981" : "#ef4444"
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const Advisory = () => {
    const {
        activePlot,
        activePlotId,
        formDrafts,
        advisoryResults,
        updateAdvisoryResult,
    } = usePlotContext();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);

    const fetchData = async () => {
        if (!activePlot) return;
        const formData = formDrafts[activePlotId] || activePlot.formData;
        if (!formData) return;

        setResults(null);
        setLoading(true);
        try {
            // Build payloads identically to DataInput.jsx to guarantee identical predictions

            // Fetch Crop
            const cropPayload = {
                N: formData.nitrogen,
                P: formData.phosphorus,
                K: formData.potassium,
                temperature: formData.temperature,
                humidity: formData.humidity,
                ph: formData.ph,
                rainfall: formData.rainfall,
            };
            const cropRes = await fetch(`${API_BASE_URL}/api/predict_crop`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cropPayload),
            }).then((r) => r.json());

            // Fetch Fertilizer
            const fertPayload = {
                Soil_pH: formData.ph,
                Soil_Moisture: formData.moisture,
                Organic_Carbon: formData.organicCarbon,
                Electrical_Conductivity: formData.electricalConductivity,
                Nitrogen_Level: formData.nitrogen,
                Phosphorus_Level: formData.phosphorus,
                Potassium_Level: formData.potassium,
                Temperature: formData.temperature,
                Humidity: formData.humidity,
                Rainfall: formData.rainfall,
                Fertilizer_Used_Last_Season: formData.fertilizerLastSeason,
                Yield_Last_Season: formData.yieldLastSeason,
                Soil_Type: formData.soilType,
                Crop_Type: formData.cropType,
                Crop_Growth_Stage: formData.cropGrowthStage,
                Season: formData.season,
                Irrigation_Type: formData.irrigationType,
                Previous_Crop: formData.previousCrop,
                Region: formData.region,
            };
            const fertRes = await fetch(
                `${API_BASE_URL}/api/predict_fertilizer`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(fertPayload),
                },
            ).then((r) => r.json());

            // Fetch Irrigation
            const irrPayload = {
                Soil_pH: formData.ph,
                Soil_Moisture: formData.moisture,
                Organic_Carbon: formData.organicCarbon,
                Electrical_Conductivity: formData.electricalConductivity,
                Temperature_C: formData.temperature,
                Humidity: formData.humidity,
                Rainfall_mm: formData.rainfall,
                Sunlight_Hours: formData.sunlightHours,
                Wind_Speed_kmh: formData.windSpeed,
                Field_Area_hectare: (
                    parseFloat(formData.fieldArea || 0) * 0.404686
                ).toFixed(2), // Acres to Hectares
                Previous_Irrigation_mm: formData.previousIrrigation,
                Soil_Type: formData.soilType,
                Crop_Type: formData.cropType,
                Crop_Growth_Stage: formData.cropGrowthStage,
                Season: formData.season,
                Irrigation_Type: formData.irrigationType,
                Water_Source: formData.waterSource,
                Mulching_Used: formData.mulchingUsed,
                Region: formData.region,
            };
            const irrRes = await fetch(
                `${API_BASE_URL}/api/predict_irrigation`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(irrPayload),
                },
            ).then((r) => r.json());

            const newResults = {
                crop: cropRes.recommended_crop || "Unknown",
                cropShap: cropRes.shap_explanation || [],
                fertilizer: fertRes.recommended_fertilizer || "Unknown",
                fertilizerShap: fertRes.shap_explanation || [],
                irrigation: irrRes.irrigation_need || "Unknown",
                irrigationShap: irrRes.shap_explanation || [],
                aiAdvice: null,
            };
            setResults(newResults);
            updateAdvisoryResult(activePlotId, newResults);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const markdownComponents = {
        h3: ({ node, children, ...props }) => (
            <h4
                className="text-xl font-bold mt-5 mb-3 text-slate-800"
                {...props}
            >
                {children}
            </h4>
        ),
        h1: "h4",
        h2: "h4",
        p: ({ node, ...props }) => (
            <p
                className="mb-5 text-lg text-slate-700 leading-relaxed"
                {...props}
            />
        ),
        ul: ({ node, ...props }) => (
            <ul className="space-y-3 mb-6 ml-2" {...props} />
        ),
        ol: ({ node, ...props }) => (
            <ol
                className="list-decimal list-outside space-y-3 mb-6 ml-6 text-lg text-slate-800 font-medium"
                {...props}
            />
        ),
        li: ({ node, ...props }) => {
            const isOrdered = node.parent?.tagName === "ol";
            if (isOrdered) return <li className="mb-3 pl-2" {...props} />;
            return (
                <li className="flex items-start gap-3 bg-white/60 p-5 rounded-xl border border-slate-200 transition-all hover:translate-x-1 hover:border-primary/50 mb-3">
                    <span className="material-symbols-outlined text-primary text-2xl shrink-0 mt-0.5">
                        check_circle
                    </span>
                    <div className="text-lg text-slate-800" {...props} />
                </li>
            );
        },
        strong: ({ node, ...props }) => (
            <strong className="font-bold text-slate-900" {...props} />
        ),
        table: ({ node, ...props }) => (
            <div className="overflow-x-auto w-full mb-6 mt-4 rounded-xl border border-slate-200 shadow-sm">
                <table
                    className="w-full text-left text-base text-slate-700 bg-white"
                    {...props}
                />
            </div>
        ),
        thead: ({ node, ...props }) => (
            <thead
                className="text-sm text-slate-800 uppercase bg-slate-50 border-b border-slate-200"
                {...props}
            />
        ),
        th: ({ node, ...props }) => (
            <th
                className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap"
                {...props}
            />
        ),
        td: ({ node, ...props }) => (
            <td className="px-6 py-4 border-t border-slate-100" {...props} />
        ),
    };

    const [aiLoading, setAiLoading] = useState(false);

    const fetchAiAdvice = async () => {
        if (!activePlot || !results) return;
        const formData = formDrafts[activePlotId] || activePlot.formData;
        if (!formData) return;

        setAiLoading(true);
        try {
            const extractTopFeatures = (shapArray) => {
                if (!shapArray || !Array.isArray(shapArray)) return "";
                return shapArray
                    .filter(([name, val]) => Number(val) > 0)
                    .sort((a, b) => Number(b[1]) - Number(a[1]))
                    .slice(0, 3)
                    .map(([name]) => name.replace(/_/g, " "))
                    .join(", ");
            };

            const aiPayload = {
                crop: results.crop,
                fertilizer: results.fertilizer,
                irrigation: results.irrigation,
                crop_reasoning: extractTopFeatures(results.cropShap),
                fertilizer_reasoning: extractTopFeatures(
                    results.fertilizerShap,
                ),
                irrigation_reasoning: extractTopFeatures(
                    results.irrigationShap,
                ),
                N: formData.nitrogen,
                P: formData.phosphorus,
                K: formData.potassium,
                ph: formData.ph,
                temperature: formData.temperature,
                rainfall: formData.rainfall,
            };
            const aiRes = await fetch(`${API_BASE_URL}/api/generate_advice`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(aiPayload),
            })
                .then((r) => r.json())
                .catch(() => ({ advice: "AI Service Unavailable." }));

            const newResults = {
                ...results,
                aiAdvice: aiRes.advice || "No advice generated.",
            };
            setResults(newResults);
            updateAdvisoryResult(activePlotId, newResults);
            setAiLoading(false);
        } catch (err) {
            console.error(err);
            setAiLoading(false);
        }
    };

    const [saveStatus, setSaveStatus] = useState(null);

    const saveAdvisoryToDB = async () => {
        if (!activePlotId || !results) return;
        setSaveStatus("saving");
        try {
            const res = await fetch(
                `${API_BASE_URL}/api/history/${activePlotId}/advisory`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(results),
                },
            );
            if (res.ok) {
                setSaveStatus("success");
                setTimeout(() => setSaveStatus(null), 3000);
            } else {
                setSaveStatus("error");
            }
        } catch (err) {
            console.error(err);
            setSaveStatus("error");
        }
    };

    useEffect(() => {
        if (activePlotId) {
            if (advisoryResults[activePlotId]) {
                setResults(advisoryResults[activePlotId]);
            } else {
                fetchData();
            }
        }
    }, [activePlotId, activePlot]);

    return (
        <div className="bg-[#f8fafc] text-on-surface min-h-screen pb-32 font-sans">
            <TopAppBar />

            <main className="pt-24 pb-32 px-4 md:px-8 w-full">
                <section className="mb-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <span className="text-sm font-bold text-primary uppercase tracking-widest">
                                Master Dashboard
                            </span>
                            <h2 className="text-4xl font-extrabold text-foreground mt-2 tracking-tight">
                                Full Spectrum Advisory
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mt-4">
                                A unified view of Crop, Fertilizer, and
                                Irrigation models executing concurrently for
                                your plot.
                            </p>
                        </div>
                        {activePlot && (
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex flex-col items-end">
                                    <div className="text-label-md font-bold opacity-70 uppercase tracking-widest">
                                        Active Plot
                                    </div>
                                    <div className="text-headline-sm font-black text-primary">
                                        {activePlot.name || activePlot.location}
                                    </div>
                                </div>
                                {results && (
                                    <button
                                        onClick={fetchData}
                                        disabled={loading}
                                        className="flex items-center gap-2 text-sm bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-full font-bold transition-colors disabled:opacity-50"
                                    >
                                        <span
                                            className={`material-symbols-outlined text-sm ${loading ? "animate-spin" : ""}`}
                                        >
                                            sync
                                        </span>
                                        Refresh Models
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {!activePlot && (
                    <div className="bg-white rounded-2xl p-16 text-center border border-outline-variant/20">
                        <span className="material-symbols-outlined text-6xl text-on-surface-variant/50 mb-4">
                            location_off
                        </span>
                        <h3 className="text-2xl font-bold text-on-surface mb-2">
                            No Plot Selected
                        </h3>
                        <p className="text-body-lg text-on-surface-variant mb-8">
                            Select a plot from the top navigation bar to run the
                            full advisory suite.
                        </p>
                        <Link
                            to="/input"
                            className="bg-primary text-white px-8 py-4 rounded-full font-bold shadow-lg hover:brightness-110 transition-all"
                        >
                            Go to Data Input
                        </Link>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-4"></div>
                        <p className="text-lg text-primary font-medium">
                            Analyzing telemetry data...
                        </p>
                    </div>
                )}

                {activePlot && !loading && results && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="bg-white rounded-2xl border-2 border-outline-variant/20 overflow-hidden flex flex-col hover:-translate-y-1 hover:border-primary/50 transition-all duration-300">
                                <div className="bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] p-6 flex flex-col items-center text-center">
                                    <div className="p-3 bg-white/50 backdrop-blur-sm rounded-full w-fit mb-4">
                                        <span className="material-symbols-outlined text-3xl text-[#2e7d32]">
                                            grass
                                        </span>
                                    </div>
                                    <h3 className="text-xs font-bold text-[#2e7d32] uppercase tracking-widest mb-1">
                                        Crop Recommendation
                                    </h3>
                                    <div className="text-3xl font-black text-on-surface capitalize truncate w-full">
                                        {results.crop.replace(/_/g, " ")}
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50/50 flex-1 min-h-[250px]">
                                    <ShapChart
                                        shapData={results.cropShap}
                                        title="Crop"
                                        icon="psychology"
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border-2 border-outline-variant/20 overflow-hidden flex flex-col hover:-translate-y-1 hover:border-primary/50 transition-all duration-300">
                                <div className="bg-gradient-to-br from-[#fff3e0] to-[#ffe0b2] p-6 flex flex-col items-center text-center">
                                    <div className="p-3 bg-white/50 backdrop-blur-sm rounded-full w-fit mb-4">
                                        <span className="material-symbols-outlined text-3xl text-[#ef6c00]">
                                            science
                                        </span>
                                    </div>
                                    <h3 className="text-xs font-bold text-[#ef6c00] uppercase tracking-widest mb-1">
                                        Fertilizer Requirement
                                    </h3>
                                    <div className="text-3xl font-black text-on-surface capitalize truncate w-full">
                                        {results.fertilizer.replace(/_/g, " ")}
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50/50 flex-1 min-h-[250px]">
                                    <ShapChart
                                        shapData={results.fertilizerShap}
                                        title="Fertilizer"
                                        icon="compost"
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border-2 border-outline-variant/20 overflow-hidden flex flex-col hover:-translate-y-1 hover:border-primary/50 transition-all duration-300">
                                <div className="bg-gradient-to-br from-[#e1f5fe] to-[#b3e5fc] p-6 flex flex-col items-center text-center">
                                    <div className="p-3 bg-white/50 backdrop-blur-sm rounded-full w-fit mb-4">
                                        <span className="material-symbols-outlined text-3xl text-[#0277bd]">
                                            water_drop
                                        </span>
                                    </div>
                                    <h3 className="text-xs font-bold text-[#0277bd] uppercase tracking-widest mb-1">
                                        Irrigation Status
                                    </h3>
                                    <div className="text-3xl font-black text-on-surface capitalize truncate w-full">
                                        {results.irrigation.replace(/_/g, " ")}
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50/50 flex-1 min-h-[250px]">
                                    <ShapChart
                                        shapData={results.irrigationShap}
                                        title="Irrigation"
                                        icon="waves"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-full w-fit">
                                    <span className="material-symbols-outlined text-3xl text-primary">
                                        smart_toy
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-title-lg font-bold text-primary uppercase tracking-widest">
                                        AI Agronomist Deep Dive
                                    </h3>
                                    <p className="text-sm text-on-surface-variant">
                                        Comprehensive reasoning, financials, and
                                        lifecycle strategy
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0">
                                {results.aiAdvice &&
                                    typeof results.aiAdvice === "object" && (
                                        <button
                                            onClick={saveAdvisoryToDB}
                                            disabled={
                                                saveStatus === "saving" ||
                                                saveStatus === "success"
                                            }
                                            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${
                                                saveStatus === "success"
                                                    ? "bg-green-100 text-green-700"
                                                    : saveStatus === "error"
                                                      ? "bg-red-100 text-red-700"
                                                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                            }`}
                                        >
                                            <span
                                                className={`material-symbols-outlined ${saveStatus === "saving" ? "animate-spin" : ""}`}
                                            >
                                                {saveStatus === "success"
                                                    ? "check_circle"
                                                    : saveStatus === "saving"
                                                      ? "refresh"
                                                      : "save"}
                                            </span>
                                            {saveStatus === "success"
                                                ? "Saved to Plot"
                                                : saveStatus === "saving"
                                                  ? "Saving..."
                                                  : "Save to DB"}
                                        </button>
                                    )}
                                <button
                                    onClick={fetchAiAdvice}
                                    disabled={aiLoading}
                                    className="flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {aiLoading ? (
                                        <span className="material-symbols-outlined animate-spin">
                                            refresh
                                        </span>
                                    ) : (
                                        <span className="material-symbols-outlined">
                                            auto_awesome
                                        </span>
                                    )}
                                    {aiLoading
                                        ? "Generating..."
                                        : "Generate AI Deep Dive"}
                                </button>
                            </div>
                        </div>

                        {!results.aiAdvice && !aiLoading && (
                            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">
                                    psychology
                                </span>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">
                                    Ready to generate your strategy?
                                </h3>
                                <p className="text-slate-500 max-w-md">
                                    Click the button above to have our AI
                                    analyze your ML predictions and generate a
                                    comprehensive farming strategy.
                                </p>
                            </div>
                        )}

                        {aiLoading && (
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center animate-pulse">
                                <span className="material-symbols-outlined text-6xl text-primary animate-bounce mb-4">
                                    smart_toy
                                </span>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">
                                    AI is thinking...
                                </h3>
                                <p className="text-slate-500 max-w-md">
                                    Analyzing your soil data, weather telemetry,
                                    and ML predictions. This may take a few
                                    seconds.
                                </p>
                            </div>
                        )}

                        {results.aiAdvice &&
                            typeof results.aiAdvice === "object" &&
                            !aiLoading && (
                                <div className="grid-cols-2 grid gap-4">
                                    {Object.entries(results.aiAdvice).map(
                                        ([key, section]) => {
                                            if (
                                                !section ||
                                                typeof section !== "object" ||
                                                !section.information
                                            )
                                                return null;

                                            let cardClass =
                                                "bg-white border-2 border-outline-variant/20 hover:-translate-y-1 hover:border-primary/50 transition-all duration-300";
                                            let headerColorClass =
                                                "text-primary bg-primary/10";
                                            let icon = "eco";

                                            if (key === "health_score") {
                                                cardClass =
                                                    "bg-[#eef2ff] border-2 border-indigo-200 hover:-translate-y-1 hover:border-indigo-400 transition-all duration-300";
                                                headerColorClass =
                                                    "text-indigo-700 bg-indigo-100";
                                                icon = "health_and_safety";
                                            } else if (key === "reasoning") {
                                                cardClass =
                                                    "bg-[#faf5ff] border-2 border-fuchsia-200 hover:-translate-y-1 hover:border-fuchsia-400 transition-all duration-300";
                                                headerColorClass =
                                                    "text-fuchsia-700 bg-fuchsia-100";
                                                icon = "psychology";
                                            } else if (key === "calendar") {
                                                cardClass =
                                                    "bg-[#f0fdf4] border-2 border-green-200 hover:-translate-y-1 hover:border-green-400 transition-all duration-300";
                                                headerColorClass =
                                                    "text-green-700 bg-green-100";
                                                icon = "calendar_month";
                                            } else if (key === "pests") {
                                                cardClass =
                                                    "bg-[#fff1f2] border-2 border-rose-200 hover:-translate-y-1 hover:border-rose-400 transition-all duration-300";
                                                headerColorClass =
                                                    "text-rose-700 bg-rose-100";
                                                icon = "bug_report";
                                            } else if (key === "economics") {
                                                cardClass =
                                                    "bg-[#fffbeb] border-2 border-amber-200 hover:-translate-y-1 hover:border-amber-400 transition-all duration-300";
                                                headerColorClass =
                                                    "text-amber-700 bg-amber-100";
                                                icon = "monitoring";
                                            }

                                            return (
                                                <div
                                                    key={key}
                                                    className={`rounded-2xl border p-8 overflow-hidden flex flex-col mb-8 ${cardClass}`}
                                                >
                                                    <h3
                                                        className={`text-xl font-black mt-2 mb-6 flex items-center gap-2 w-fit px-5 py-2 rounded-full ${headerColorClass}`}
                                                    >
                                                        <span className="material-symbols-outlined">
                                                            {icon}
                                                        </span>{" "}
                                                        {section.title || key}
                                                    </h3>
                                                    <div className="markdown-body">
                                                        <ReactMarkdown
                                                            remarkPlugins={[
                                                                remarkGfm,
                                                            ]}
                                                            rehypePlugins={[
                                                                rehypeRaw,
                                                            ]}
                                                            components={
                                                                markdownComponents
                                                            }
                                                        >
                                                            {
                                                                section.information
                                                            }
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            )}

                        {/* Error state if string fallback */}
                        {results.aiAdvice &&
                            typeof results.aiAdvice === "string" &&
                            !aiLoading && (
                                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 flex flex-col">
                                    <h3 className="text-xl font-bold text-rose-700 mb-2">
                                        AI Generation Error
                                    </h3>
                                    <p className="text-rose-600">
                                        {results.aiAdvice}
                                    </p>
                                </div>
                            )}
                    </div>
                )}
            </main>
            <BottomNavBar />
        </div>
    );
};

export default Advisory;
