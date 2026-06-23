"use client";

import { useState, useEffect } from "react";
import { Settings, Save, AlertCircle, Cpu, Mic, Sliders } from "lucide-react";
import GlassCard from "../../../components/admin/GlassCard";

interface SystemSetting {
  id: number;
  key: string;
  value: string;
  category: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/admin/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      const data: SystemSetting[] = await res.json();
      
      const settingsMap: Record<string, string> = {};
      data.forEach(item => {
        settingsMap[item.key] = item.value;
      });
      setSettings(settingsMap);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : "Error fetching settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: string) => {
    try {
      setSaving(true);
      setMessage(null);
      
      const res = await fetch(`http://localhost:8000/admin/settings/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value })
      });
      
      if (!res.ok) throw new Error("Failed to save setting");
      
      setMessage({ type: 'success', text: "Settings saved successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : "Error saving" });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded-lg"></div>
        <div className="space-y-4">
          <GlassCard className="h-64 bg-slate-800/50"><div /></GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12 max-w-4xl">
      {/* Header */}
      <div className="border-b border-blue-900/30 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
          <Settings className="text-blue-500" size={32} />
          System Settings
        </h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Configure AI behavior, LLM preferences, and Voice outputs.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          <AlertCircle size={20} />
          <p className="font-medium text-sm">{message.text}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Core AI Settings */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Cpu size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Engine</h2>
              <p className="text-xs text-slate-400">Configure the underlying Language Model provider.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">LLM Provider</label>
              <select 
                value={settings["llm_provider"] || "openai"} 
                onChange={(e) => handleChange("llm_provider", e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
              >
                <option value="openai">OpenAI (gpt-4o-mini)</option>
                <option value="groq">Groq (Llama-3)</option>
              </select>
              <button 
                onClick={() => handleSave("llm_provider", settings["llm_provider"])}
                disabled={saving}
                className="mt-2 text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Save size={14} /> Save Change
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Temperature</label>
              <input 
                type="number" 
                step="0.1" 
                min="0" 
                max="1"
                value={settings["llm_temperature"] || "0.3"} 
                onChange={(e) => handleChange("llm_temperature", e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button 
                onClick={() => handleSave("llm_temperature", settings["llm_temperature"])}
                disabled={saving}
                className="mt-2 text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Save size={14} /> Save Change
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Voice Settings */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Mic size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Voice & Audio</h2>
              <p className="text-xs text-slate-400">Configure TTS and Voice Activity Detection (VAD).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Agent Voice</label>
              <select 
                value={settings["voice_id"] || "alloy"} 
                onChange={(e) => handleChange("voice_id", e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
              >
                <option value="alloy">Alloy (Neutral)</option>
                <option value="echo">Echo (Male)</option>
                <option value="shimmer">Shimmer (Female)</option>
                <option value="nova">Nova (Female - Expressive)</option>
              </select>
              <button 
                onClick={() => handleSave("voice_id", settings["voice_id"])}
                disabled={saving}
                className="mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Save size={14} /> Save Change
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">VAD Sensitivity</label>
              <input 
                type="number" 
                step="0.1" 
                min="0.1" 
                max="0.9"
                value={settings["vad_threshold"] || "0.5"} 
                onChange={(e) => handleChange("vad_threshold", e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button 
                onClick={() => handleSave("vad_threshold", settings["vad_threshold"])}
                disabled={saving}
                className="mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Save size={14} /> Save Change
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Global Limits */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">System Limits</h2>
              <p className="text-xs text-slate-400">Global safeguards and constraints.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Max Call Duration (seconds)</label>
              <input 
                type="number" 
                min="60"
                value={settings["max_call_duration"] || "3600"} 
                onChange={(e) => handleChange("max_call_duration", e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <button 
                onClick={() => handleSave("max_call_duration", settings["max_call_duration"])}
                disabled={saving}
                className="mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Save size={14} /> Save Change
              </button>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}