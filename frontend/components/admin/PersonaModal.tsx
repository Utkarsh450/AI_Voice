import { useState, useEffect } from "react";
import { X, Save, Sparkles, Server } from "lucide-react";
import GlassCard from "./GlassCard";

interface PersonaData {
  id?: number;
  name: string;
  description: string;
  systemPrompt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PersonaData) => Promise<void>;
  initialData?: PersonaData | null;
}

export default function PersonaModal({ isOpen, onClose, onSave, initialData }: Props) {
  const [formData, setFormData] = useState<PersonaData>({
    name: "",
    description: "",
    systemPrompt: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: "", description: "", systemPrompt: "" });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <GlassCard className="w-full max-w-2xl animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-center justify-between border-b border-blue-900/30 pb-4 mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            {initialData ? "Edit Persona" : "Create New Persona"}
            <Sparkles className="text-blue-400" size={18} />
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Agent Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Tech_Support"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                <Server size={14} className="text-amber-400" />
                Routing Description (For Supervisor)
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Describe WHEN the LangGraph Supervisor should route a user's question to this agent.
              </p>
              <input
                required
                type="text"
                placeholder="e.g. Route to this agent if the user asks about technical issues or bugs."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">System Prompt</label>
              <p className="text-xs text-slate-500 mb-2">
                The core instructions that govern how this specialized agent behaves.
              </p>
              <textarea
                required
                rows={6}
                placeholder="You are an expert technical support assistant..."
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-blue-900/30">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all hover:scale-[1.02]"
            >
              <Save size={16} />
              {loading ? "Saving..." : "Save Persona"}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
