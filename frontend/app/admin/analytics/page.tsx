"use client";

import { useState, useEffect } from "react";
import { BarChart3, Clock, MessageSquare, PhoneCall, TrendingUp, AlertCircle, Download, CheckCircle2, XCircle, Activity } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import GlassCard from "../../../components/admin/GlassCard";

interface AnalyticsData {
  total_sessions: number;
  total_messages: number;
  avg_duration_seconds: number;
  personas: { name: string; value: number }[];
  timeline: { date: string; calls: number }[];
  recent_calls: { id: number; date: string; duration: number; persona: string; status: string }[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("http://localhost:8000/admin/analytics/dashboard");
        if (!res.ok) throw new Error("Failed to load analytics");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <GlassCard key={i} className="h-32 bg-slate-800/50" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="h-96 bg-slate-800/50" />
          <GlassCard className="h-96 bg-slate-800/50" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
        <AlertCircle size={20} />
        <p className="font-medium">{error || "Failed to load data"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="border-b border-blue-900/30 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
          <BarChart3 className="text-blue-500" size={32} />
          Platform Analytics
        </h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Monitor your AI voice agent usage, sessions, and routing trends.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Total Calls</p>
              <h3 className="text-4xl font-black text-white">{data.total_sessions}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <PhoneCall size={24} />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Avg. Duration</p>
              <h3 className="text-4xl font-black text-white">
                {Math.floor(data.avg_duration_seconds / 60)}m {Math.floor(data.avg_duration_seconds % 60)}s
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock size={24} />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Total Messages</p>
              <h3 className="text-4xl font-black text-white">{data.total_messages}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MessageSquare size={24} />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="h-[400px] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-blue-400" />
            <h3 className="text-lg font-bold text-white">Call Volume (7 Days)</h3>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.timeline} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="calls" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="h-[400px] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={18} className="text-purple-400" />
            <h3 className="text-lg font-bold text-white">Persona Routing Distribution</h3>
          </div>
          <div className="flex-1 w-full min-h-0">
            {data.personas.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.personas} margin={{ top: 5, right: 20, bottom: 25, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    cursor={{ fill: '#1e293b', opacity: 0.4 }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.personas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                No persona routing data available yet.
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Recent Calls Table */}
      <GlassCard className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-blue-400" />
            <h3 className="text-lg font-bold text-white">Recent Sessions</h3>
          </div>
          <button 
            onClick={() => {
              const headers = ["Session ID", "Date", "Duration (s)", "Persona", "Status"];
              const csvContent = "data:text/csv;charset=utf-8," 
                + headers.join(",") + "\n"
                + data.recent_calls.map(c => `${c.id},${c.date},${c.duration},${c.persona},${c.status}`).join("\n");
              
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "voice_analytics.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium py-2 px-4 rounded-lg transition-colors border border-slate-700"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs uppercase bg-slate-900/50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Session ID</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Persona</th>
                <th className="px-6 py-4 font-semibold">Duration</th>
                <th className="px-6 py-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.recent_calls?.length > 0 ? (
                data.recent_calls.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">#{call.id}</td>
                    <td className="px-6 py-4">{call.date}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-800 px-2.5 py-1 rounded-md text-xs border border-slate-700">
                        {call.persona}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {Math.floor(call.duration / 60)}m {call.duration % 60}s
                    </td>
                    <td className="px-6 py-4 flex justify-end">
                      {call.status === "completed" ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/20">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      ) : call.status === "active" ? (
                        <span className="flex items-center gap-1.5 text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full text-xs font-medium border border-blue-500/20">
                          <Activity size={14} className="animate-pulse" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-400 bg-slate-800 px-3 py-1 rounded-full text-xs font-medium border border-slate-700">
                          <XCircle size={14} /> {call.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No recent calls found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}