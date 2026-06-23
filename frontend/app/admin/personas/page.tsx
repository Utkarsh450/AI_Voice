"use client";

import { useState, useEffect } from "react";
import { Bot, Plus, Trash2, Edit2, AlertCircle } from "lucide-react";
import GlassCard from "../../../components/admin/GlassCard";
import PersonaModal from "../../../components/admin/PersonaModal";

interface Persona {
  id: number;
  name: string;
  description: string;
  systemPrompt: string;
  createdAt: string;
}

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);

  const fetchPersonas = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/admin/personas");
      if (!res.ok) throw new Error("Failed to fetch personas");
      const data = await res.json();
      setPersonas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  const handleSave = async (data: any) => {
    const url = editingPersona 
      ? `http://localhost:8000/admin/personas/${editingPersona.id}`
      : "http://localhost:8000/admin/personas";
      
    const method = editingPersona ? "PUT" : "POST";
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) throw new Error("Failed to save persona");
    await fetchPersonas();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this Persona?")) return;
    try {
      const res = await fetch(`http://localhost:8000/admin/personas/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete persona");
      await fetchPersonas();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting");
    }
  };

  const openCreateModal = () => {
    setEditingPersona(null);
    setIsModalOpen(true);
  };

  const openEditModal = (persona: Persona) => {
    setEditingPersona(persona);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between border-b border-blue-900/30 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
            <Bot className="text-blue-500" size={32} />
            Specialist Network
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Manage the LangGraph Multi-Agent network and configure specialized Personas.
          </p>
        </div>
        
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-105"
        >
          <Plus size={18} />
          Add Specialist
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
          <AlertCircle size={18} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} className="h-64 animate-pulse bg-slate-900/50"><div /></GlassCard>
          ))}
        </div>
      ) : personas.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-900/20 flex items-center justify-center mb-4 text-blue-400">
            <Bot size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Specialists Found</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Your Multi-Agent network is currently empty. Add specialized agents to allow the Supervisor to route complex queries.
          </p>
          <button
            onClick={openCreateModal}
            className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Create Your First Persona
          </button>
        </GlassCard>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {personas.map((persona) => (
            <GlassCard key={persona.id} className="flex flex-col group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50" />
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{persona.name}</h3>
                    <p className="text-xs text-slate-500">ID: {persona.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(persona)}
                    className="p-1.5 rounded-md hover:bg-blue-500/20 text-blue-400 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(persona.id)}
                    className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <h4 className="text-xs font-bold text-amber-400/80 uppercase tracking-wider mb-1">Routing Logic</h4>
                  <p className="text-sm text-slate-300 line-clamp-2 bg-amber-500/5 border border-amber-500/10 p-2 rounded-lg">
                    {persona.description}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-blue-400/80 uppercase tracking-wider mb-1">System Prompt</h4>
                  <p className="text-sm text-slate-400 line-clamp-4 font-mono text-xs bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                    {persona.systemPrompt}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <PersonaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingPersona}
      />
    </div>
  );
}
